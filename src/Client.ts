import Connection, { ConnectionInfo } from './Connection/Connection';
import WebSocketConnection from './Connection/WebSocketConnection';
import DirectConnection from './Connection/DirectConnection';
import { decodeCtcp, padLeft } from './Toolkit/StringTools';
import Message, { MessageConstructor } from './Message/Message';
import ObjectTools from './Toolkit/ObjectTools';
import MessageCollector from './Message/MessageCollector';
import * as MessageTypes from './Message/MessageTypes';
import Capability, { ServerCapability } from './Capability/Capability';
import * as CoreCapabilities from './Capability/CoreCapabilities';

import { EventEmitter, Listener } from 'typed-event-emitter';

import {
	Ping, Pong,
	CapabilityNegotiation, Password, UserRegistration, NickChange,
	PrivateMessage, Notice
} from './Message/MessageTypes/Commands';

import {
	Reply001Welcome, Reply004ServerInfo, Reply005ISupport,
	Error462AlreadyRegistered
} from './Message/MessageTypes/Numerics';

export type EventHandler<T extends Message = Message> = (message: T) => void;
export type EventHandlerList<T extends Message = Message> = {
	[name: string]: EventHandler<T>;
};

export interface SupportedChannelModes {
	list: string;
	alwaysWithParam: string;
	paramWhenSet: string;
	noParam: string;
}

export default class Client extends EventEmitter {
	protected _connection: Connection;
	protected _nick: string;
	protected _userName: string;

	protected _realName: string;
	protected _registered: boolean = false;

	protected _supportsCapabilities: boolean = true;

	protected _events: Map<MessageConstructor, EventHandlerList> = new Map();
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

	onCtcp: (handler: (target: string, user: string, command: string, message: string, msg: PrivateMessage) => void)
		=> Listener = this.registerEvent();
	onCtcpReply: (handler: (target: string, user: string, command: string, message: string, msg: Notice) => void)
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

	public constructor({connection, webSocket, channelTypes, debugLevel}: {
		connection: ConnectionInfo,
		webSocket?: boolean,
		channelTypes?: string,
		debugLevel?: number;
	}) {
		super();

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
					this._supportsCapabilities = false;
					return;
				}
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
			// tslint:disable:no-console
			if (this._debugLevel >= 1) {
				console.log(`> recv: \`${line}\``);
			}
			let parsedMessage = Message.parse(line, this);
			if (this._debugLevel >= 2) {
				console.log('> recv parsed:', parsedMessage);
			}
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
			this.createMessage(Pong, {message}).send();
		});

		this.onMessage(Reply001Welcome, () => {
			this._registered = true;
			this.emit(this.onRegister);
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
					this.emit(this.onAction, target, nick, ctcpMessage.message, msg);
				} else {
					this.emit(this.onCtcp, target, nick, ctcpMessage.command, ctcpMessage.message, msg);
				}
			}

			this.emit(this.onPrivmsg, target, nick, message, msg);
		});

		this.onMessage(Notice, (msg: Notice) => {
			const {params: {target, message}} = msg;
			const ctcpMessage = decodeCtcp(message);
			const nick = msg.prefix && msg.prefix.nick;

			if (ctcpMessage) {
				this.emit(this.onCtcpReply, target, nick, ctcpMessage.command, ctcpMessage.message, msg);
			}

			this.emit(this.onNotice, target, nick, message, msg);
		});

		this._connection.on('disconnect', (reason?: Error) => {
			this.emit(this.onDisconnect, reason);
		});

		this._nick = connection.nick;
		this._userName = connection.userName || connection.nick;
		this._realName = connection.realName || connection.nick;

		if (channelTypes) {
			this._channelTypes = channelTypes;
		}
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
		this._registered = false;
		this._supportsCapabilities = true;
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
		const mappedCapList = ObjectTools.fromArray(capList, cap => ({[cap.name]: cap}));
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
		if (this._debugLevel >= 1) {
			// tslint:disable-next-line:no-console
			console.log(`< send: \`${line}\``);
		}
		this._connection.sendLine(line);
	}

	public onMessage<T extends Message>(
		type: MessageConstructor<T>,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
		if (!this._events.has(type)) {
			this._events.set(type, {});
		}

		let handlerList = this._events.get(type) as EventHandlerList<T>;

		if (!handlerName) {
			do {
				handlerName = type.name + padLeft(Math.random() * 10000, 4, '0');
			} while (handlerName in handlerList);
		}

		handlerList[handlerName] = handler;

		return handlerName;
	}

	public createMessage<T extends Message, D>(
		type: MessageConstructor<T, D>,
		params: {[name in keyof D]?: string}
	): T {
		return type.create(this, params);
	}

	public sendMessage<T extends Message, D>(
		type: MessageConstructor<T, D>,
		params: {[name in keyof D]?: string}
	): void {
		this.createMessage(type, params).send();
	}

	public async sendMessageAndCaptureReply<T extends Message, D>(
		type: MessageConstructor<T, D>,
		params: {[name in keyof D]?: string}
	): Promise<Message[]> {
		return this.createMessage(type, params).sendAndCaptureReply();
	}

	public get channelTypes(): string {
		return this._channelTypes;
	}

	public get supportedChannelModes(): SupportedChannelModes {
		return this._supportedChannelModes;
	}

	public collect(originalMessage: Message, ...types: MessageConstructor[]) {
		const collector = new MessageCollector(this, originalMessage, ...types);
		this._collectors.push(collector);
		return collector;
	}

	public stopCollect(collector: MessageCollector): void {
		this._collectors.splice(this._collectors.findIndex(value => value === collector), 1);
	}

	private handleEvents(message: Message): void {
		this._collectors.some(collector => collector.collect(message));

		const handlers: EventHandlerList | undefined = this._events.get(message.constructor as MessageConstructor);
		if (!handlers) {
			return;
		}

		for (const handler of Object.values(handlers)) {
			handler(message);
		}
	}
}
