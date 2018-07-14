import Connection, { ConnectionInfo } from './Connection/Connection';
import WebSocketConnection from './Connection/WebSocketConnection';
import DirectConnection from './Connection/DirectConnection';
import { decodeCtcp, padLeft } from './Toolkit/StringTools';
import Message, { MessageConstructor } from './Message/Message';
import ObjectTools, { ObjMap } from './Toolkit/ObjectTools';
import MessageCollector from './Message/MessageCollector';
import * as MessageTypes from './Message/MessageTypes';
import Capability, { ServerCapability } from './Capability/Capability';
import * as CoreCapabilities from './Capability/CoreCapabilities';
import randomstring = require('randomstring');

import { EventEmitter, Listener } from './TypedEventEmitter';

import {
	Ping, Pong,
	CapabilityNegotiation, Password, UserRegistration, NickChange,
	PrivateMessage, Notice,
	ChannelJoin, ChannelPart
} from './Message/MessageTypes/Commands';

import {
	Reply001Welcome, Reply004ServerInfo, Reply005ISupport,
	Error462AlreadyRegistered
} from './Message/MessageTypes/Numerics';
import ClientQuit from './Message/MessageTypes/Commands/ClientQuit';

export type EventHandler<T extends Message = Message> = (message: T) => void;
export type EventHandlerList<T extends Message = Message> = Map<string, EventHandler<T>>;

export interface SupportedChannelModes {
	list: string;
	alwaysWithParam: string;
	paramWhenSet: string;
	noParam: string;
}

export type MessageParams<D> = {
	[name in keyof D]?: string;
};

export default class Client extends EventEmitter {
	protected _connection: Connection;
	protected _nick: string;
	protected _userName: string;

	protected _realName: string;
	protected _registered: boolean = false;

	protected _supportsCapabilities: boolean = true;

	protected _events: Map<string, EventHandlerList> = new Map();
	protected _registeredMessageTypes: Map<string, MessageConstructor<Message>> = new Map;

	// emitted events
	onConnect: (handler: () => void) => Listener = this.registerEvent();
	onRegister: (handler: () => void) => Listener = this.registerEvent();
	onDisconnect: (handler: (reason?: Error) => void) => Listener = this.registerEvent();

	onPrivmsg: (handler: (target: string, user: string, message: string, msg: PrivateMessage) => void)
		=> Listener = this.registerEvent();
	onAction: (handler: (target: string, user: string, message: string, msg: PrivateMessage) => void)
		=> Listener = this.registerEvent();
	onNotice: (handler: (target: string, user: string, message: string, msg: Notice) => void)
		=> Listener = this.registerEvent();

	onCtcp: (handler: (target: string, user: string, command: string, params: string, msg: PrivateMessage) => void)
		=> Listener = this.registerEvent();
	onCtcpReply: (handler: (target: string, user: string, command: string, params: string, msg: Notice) => void)
		=> Listener = this.registerEvent();

	// sane defaults based on RFC 1459
	protected _channelTypes: string = '#&';
	protected _supportedUserModes: string = 'iwso';
	protected _supportedChannelModes: SupportedChannelModes = {
		list: 'b',
		alwaysWithParam: 'ovk',
		paramWhenSet: 'l',
		noParam: 'imnpst'
	};
	protected _supportedFeatures: { [feature: string]: true | string } = {};
	protected _collectors: MessageCollector[] = [];

	protected _clientCapabilities: Map<string, Capability> = new Map;
	protected _serverCapabilities: Map<string, ServerCapability> = new Map;
	protected _negotiatedCapabilities: Map<string, ServerCapability> = new Map;

	protected _debugLevel: number;

	protected _pingOnInactivity: number;
	protected _pingTimeout: number;
	protected _pingCheckTimer: NodeJS.Timer;
	protected _pingTimeoutTimer: NodeJS.Timer;

	public constructor({connection, webSocket, channelTypes, debugLevel}: {
		connection: ConnectionInfo,
		webSocket?: boolean,
		channelTypes?: string,
		debugLevel?: number;
	}) {
		super();

		this._pingOnInactivity = connection.pingOnInactivity || 60;
		this._pingTimeout = connection.pingTimeout || 10;

		this._debugLevel = debugLevel || 0;

		if (webSocket) {
			this._connection = new WebSocketConnection(connection);
		} else {
			this._connection = new DirectConnection(connection);
		}

		this.registerCoreMessageTypes();

		for (const cap of Object.values(CoreCapabilities)) {
			this.registerCapability(cap);
		}

		this._connection.on('connect', () => {
			this.sendMessageAndCaptureReply(CapabilityNegotiation, {
				command: 'LS',
				version: '302'
			}).then((capReply: CapabilityNegotiation[]) => {
				if (!capReply.length || !(capReply[0] instanceof CapabilityNegotiation)) {
					return;
				}
				this._supportsCapabilities = true;
				const capLists = capReply.map(
					line => ObjectTools.fromArray(line.params.capabilities.split(' '), (part: string) => {
						if (!part) {
							return {};
						}
						const [cap, param] = part.split('=', 2);
						return {
							[cap]: {
								name: cap,
								param: param || true
							}
						};
					}));
				this._serverCapabilities = new Map<string, ServerCapability>(Object.entries(Object.assign({}, ...capLists)));
				const capabilitiesToNegotiate = capLists.map(list => {
					const capNames = Object.keys(list);
					return Array.from(this._clientCapabilities.entries())
						.filter(([name]) => capNames.includes(name))
						.map(([, cap]) => cap);
				});
				this._negotiateCapabilityBatch(capabilitiesToNegotiate).then(() => {
					this.sendMessage(CapabilityNegotiation, {command: 'END'});
					this._registered = true;
					this.emit(this.onRegister);
				});
			});
			if (connection.password) {
				this.sendMessage(Password, {password: connection.password});
			}
			this.sendMessage(NickChange, {nick: this._nick});
			this.sendMessage(UserRegistration, {
				user: this._userName,
				mode: '8',
				unused: '*',
				realName: this._realName
			});
		});

		this._connection.on('lineReceived', (line: string) => {
			const timestamp = (new Date()).toLocaleString();
			// tslint:disable:no-console
			if (this._debugLevel >= 1) {
				console.log(`[${timestamp}] > recv: \`${line}\``);
			}
			let parsedMessage = Message.parse(line, this);
			if (this._debugLevel >= 2) {
				console.log(`[${timestamp}] > recv parsed:`, parsedMessage);
			}
			this._startPingCheckTimer();
			this.handleEvents(parsedMessage);
			// tslint:enable:no-console
		});

		this.onMessage(CapabilityNegotiation, ({params: {command, capabilities}}: CapabilityNegotiation) => {
			// tslint:disable-next-line:switch-default
			switch (command.toUpperCase()) {
				case 'NEW': {
					const capList = ObjectTools.fromArray<string, ServerCapability, {}>(capabilities.split(' '), (part: string) => {
						if (!part) {
							return {};
						}
						const [cap, param] = part.split('=', 2);
						return {
							[cap]: {
								name: cap,
								param: param || true
							}
						};
					});
					for (const [name, cap] of Object.entries<ServerCapability>(capList)) {
						this._serverCapabilities.set(name, cap);
					}
					const capNames = Object.keys(capList);
					this._negotiateCapabilities(Array.from(this._clientCapabilities.entries())
						.filter(([name]) => capNames.includes(name))
						.map(([, cap]) => cap));
					break;
				}

				case 'DEL': {
					for (const cap of capabilities.split(' ')) {
						this._serverCapabilities.delete(cap);
						this._negotiatedCapabilities.delete(cap);
					}
					break;
				}
			}
		});

		this.onMessage(Ping, ({params: {message}}: Ping) => {
			this.sendMessage(Pong, {message});
		});

		this.onMessage(Reply001Welcome, () => {
			if (!this._supportsCapabilities) {
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onMessage(Reply004ServerInfo, ({params: {userModes}}: Reply004ServerInfo) => {
			if (userModes) {
				this._supportedUserModes = userModes;
			}
		});

		this.onMessage(Reply005ISupport, ({params: {supports}}: Reply005ISupport) => {
			this._supportedFeatures = Object.assign(
				this._supportedFeatures,
				ObjectTools.fromArray(supports.split(' '), (part: string) => {
					const [support, param] = part.split('=', 2);
					return {[support]: param || true};
				})
			);
		});

		this.onMessage(Error462AlreadyRegistered, () => {
			// what, I thought we are not registered yet?
			if (!this._registered) {
				// screw this, we are now.
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onMessage(PrivateMessage, (msg: PrivateMessage) => {
			const {params: {target, message}} = msg;
			const ctcpMessage = decodeCtcp(message);
			const nick = msg.prefix && msg.prefix.nick;

			if (ctcpMessage) {
				if (ctcpMessage.command === 'ACTION') {
					this.emit(this.onAction, target, nick, ctcpMessage.params, msg);
				} else {
					this.emit(this.onCtcp, target, nick, ctcpMessage.command, ctcpMessage.params, msg);
				}
			}

			this.emit(this.onPrivmsg, target, nick, message, msg);
		});

		this.onMessage(Notice, (msg: Notice) => {
			const {params: {target, message}} = msg;
			const ctcpMessage = decodeCtcp(message);
			const nick = msg.prefix && msg.prefix.nick;

			if (ctcpMessage) {
				this.emit(this.onCtcpReply, target, nick, ctcpMessage.command, ctcpMessage.params, msg);
			}

			this.emit(this.onNotice, target, nick, message, msg);
		});

		this.onRegister(() => this._startPingCheckTimer());

		this._connection.on('disconnect', (reason?: Error) => {
			this._registered = false;
			clearTimeout(this._pingCheckTimer);
			clearTimeout(this._pingTimeoutTimer);
			this.emit(this.onDisconnect, reason);
		});

		this._nick = connection.nick;
		this._userName = connection.userName || connection.nick;
		this._realName = connection.realName || connection.nick;

		if (channelTypes) {
			this._channelTypes = channelTypes;
		}
	}

	public pingCheck() {
		const token = randomstring.generate(16);
		const handler = this.onMessage(Pong, (msg: Pong) => {
			const {params: {message}} = msg;
			if (message === token) {
				clearTimeout(this._pingTimeoutTimer);
				this.removeMessageListener(handler);
			}
		});
		this._pingTimeoutTimer = setTimeout(
			() => {
				this.removeMessageListener(handler);
				this.reconnect('Ping timeout');
			},
			this._pingTimeout * 1000
		);
		this.sendMessage(Ping, {message: token});
	}

	public async reconnect(message?: string) {
		await this.quit(message);
		return this.connect();
	}

	public registerMessageType(cls: MessageConstructor) {
		if (cls.COMMAND !== '') {
			this._registeredMessageTypes.set(cls.COMMAND.toUpperCase(), cls);
		}
	}

	public knowsCommand(command: string): boolean {
		return this._registeredMessageTypes.has(command.toUpperCase());
	}

	public getCommandClass(command: string): MessageConstructor | undefined {
		return this._registeredMessageTypes.get(command.toUpperCase());
	}

	protected registerCoreMessageTypes() {
		ObjectTools.forEach(MessageTypes.Commands, (type: MessageConstructor) => {
			this.registerMessageType(type);
		});

		ObjectTools.forEach(MessageTypes.Numerics, (type: MessageConstructor) => {
			this.registerMessageType(type);
		});
	}

	public async connect(): Promise<void> {
		this._supportsCapabilities = false;
		this._negotiatedCapabilities = new Map;
		await this._connection.connect();
		this.emit(this.onConnect);
	}

	protected async _negotiateCapabilityBatch(
		capabilities: ServerCapability[][]
	): Promise<(ServerCapability[] | Error)[]> {
		return Promise.all(capabilities.filter(list => list.length).map(
			(capList: ServerCapability[]) => this._negotiateCapabilities(capList)
		));
	}

	protected async _negotiateCapabilities(capList: ServerCapability[]): Promise<ServerCapability[] | Error> {
		const mappedCapList: ObjMap<object, ServerCapability> = ObjectTools.fromArray(capList, cap => ({[cap.name]: cap}));
		const messages = await this.sendMessageAndCaptureReply(CapabilityNegotiation, {
			command: 'REQ',
			capabilities: capList.map(cap => cap.name).join(' ')
		});

		const capReply = messages.shift();
		if (!capReply) {
			throw new Error('capability negotiation failed unexpectedly without any reply');
		}
		if (!(capReply instanceof CapabilityNegotiation)) {
			throw new Error(`capability negotiation failed unexpectedly with "${capReply.command}" command`);
		}
		if (capReply.params.command === 'ACK') {
			// filter is necessary because some networks seem to add trailing spaces...
			const newCapNames = capReply.params.capabilities.split(' ').filter(c => c);
			const newNegotiatedCaps: ServerCapability[] = newCapNames.map(capName => mappedCapList[capName]);
			for (const newCap of newNegotiatedCaps) {
				let mergedCap = this._clientCapabilities.get(newCap.name) as ServerCapability;
				mergedCap.param = newCap.param;
				this._negotiatedCapabilities.set(mergedCap.name, mergedCap);
			}
			return newNegotiatedCaps;
		} else {
			return new Error('capabilities failed to negotiate');
		}
	}

	public async registerCapability(cap: Capability) {
		this._clientCapabilities.set(cap.name, cap);

		if (cap.messageTypes) {
			for (const messageType of cap.messageTypes) {
				this.registerMessageType(messageType);
			}
		}

		if (this._serverCapabilities.has(cap.name)) {
			return this._negotiateCapabilities([cap]);
		}

		return [];
	}

	public send(message: Message): void {
		const line = message.toString();
		const timestamp = (new Date()).toLocaleString();
		if (this._debugLevel >= 1) {
			// tslint:disable-next-line:no-console
			console.log(`[${timestamp}] < send: \`${line}\``);
		}
		this._connection.sendLine(line);
	}

	public onMessage<T extends Message>(
		type: MessageConstructor<T> | string,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
		const commandName = typeof type === 'string' ? type : type.COMMAND;
		if (!this._events.has(commandName)) {
			this._events.set(commandName, new Map);
		}

		let handlerList = this._events.get(commandName)!;

		if (!handlerName) {
			do {
				handlerName = `${commandName}:${padLeft(Math.random() * 10000, 4, '0')}`;
			} while (handlerList.has(handlerName));
		}

		handlerList.set(handlerName, handler);

		return handlerName;
	}

	public removeMessageListener(handlerName: string) {
		const [commandName] = handlerName.split(':');
		if (!this._events.has(commandName)) {
			return;
		}

		this._events.get(commandName)!.delete(handlerName);
	}

	public createMessage<T extends Message, D>(
		type: MessageConstructor<T, D>,
		params: MessageParams<D>
	): T {
		return type.create(this, params);
	}

	public sendMessage<T extends Message, D>(
		type: MessageConstructor<T, D>,
		params: MessageParams<D>
	): void {
		this.createMessage(type, params).send();
	}

	public async sendMessageAndCaptureReply<T extends Message, D>(
		type: MessageConstructor<T, D>,
		params: MessageParams<D>
	): Promise<Message[]> {
		return this.createMessage(type, params).sendAndCaptureReply();
	}

	public get channelTypes(): string {
		return this._channelTypes;
	}

	public get supportedChannelModes(): SupportedChannelModes {
		return this._supportedChannelModes;
	}

	public get isConnected() {
		return this._connection.isConnected;
	}

	public get isConnecting() {
		return this._connection.isConnecting;
	}

	public get isRegistered() {
		return this._registered;
	}

	/** @private */
	public collect(originalMessage: Message, ...types: MessageConstructor[]) {
		const collector = new MessageCollector(this, originalMessage, ...types);
		this._collectors.push(collector);
		return collector;
	}

	/** @private */
	public stopCollect(collector: MessageCollector): void {
		this._collectors.splice(this._collectors.findIndex(value => value === collector), 1);
	}

	// convenience methods
	public join(channel: string, key?: string) {
		this.sendMessage(ChannelJoin, {channel, key});
	}

	public part(channel: string) {
		this.sendMessage(ChannelPart, {channel});
	}

	public async quit(message?: string) {
		return new Promise<void>(resolve => {
			this.sendMessage(ClientQuit, {message});
			const handler = () => {
				this._connection.removeListener('disconnect', handler);
				resolve();
			};
			this._connection.addListener('disconnect', handler);
			this._connection.disconnect();
		});
	}

	// event helper
	private handleEvents(message: Message): void {
		this._collectors.some(collector => collector.collect(message));

		const handlers: EventHandlerList | undefined = this._events.get((message.constructor as MessageConstructor).COMMAND);
		if (!handlers) {
			return;
		}

		for (const handler of handlers.values()) {
			handler(message);
		}
	}

	private _startPingCheckTimer() {
		clearTimeout(this._pingCheckTimer);
		this._pingCheckTimer = setTimeout(
			() => this.pingCheck(),
			this._pingOnInactivity * 1000
		);
	}
}
