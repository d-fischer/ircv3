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
import * as clone from 'clone';

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
import Logger, { LogLevel } from '@d-fischer/logger';
import { ConstructedType, MessageParams } from './Toolkit/TypeTools';

// tslint:disable:no-floating-promises

export type EventHandler<T extends Message = Message> = (message: T) => void;
export type EventHandlerList<T extends Message = Message> = Map<string, EventHandler<T>>;

export interface SupportedChannelModes {
	list: string;
	alwaysWithParam: string;
	paramWhenSet: string;
	noParam: string;
}

interface ClientOptions {
	connection: ConnectionInfo;
	webSocket?: boolean;
	channelTypes?: string;
	logLevel?: number;
}

export interface ServerProperties {
	channelTypes: string;
	supportedUserModes: string;
	supportedChannelModes: SupportedChannelModes;
}

// sane defaults based on RFC 1459
export const defaultServerProperties: ServerProperties = {
	channelTypes: '#&',
	supportedUserModes: 'iwso',
	supportedChannelModes: {
		list: 'b',
		alwaysWithParam: 'ovk',
		paramWhenSet: 'l',
		noParam: 'imnpst'
	}
};

export default class Client extends EventEmitter {
	protected _connection: Connection;
	protected _nick: string;
	protected _userName: string;

	protected _realName: string;
	protected _registered: boolean = false;

	protected _supportsCapabilities: boolean = true;

	protected _events: Map<string, EventHandlerList> = new Map();
	protected _registeredMessageTypes: Map<string, MessageConstructor> = new Map;

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

	protected _serverProperties: ServerProperties = clone(defaultServerProperties, false);
	protected _supportedFeatures: { [feature: string]: true | string } = {};
	protected _collectors: MessageCollector[] = [];

	protected _clientCapabilities: Map<string, Capability> = new Map;
	protected _serverCapabilities: Map<string, ServerCapability> = new Map;
	protected _negotiatedCapabilities: Map<string, ServerCapability> = new Map;

	protected _pingOnInactivity: number;
	protected _pingTimeout: number;
	protected _pingCheckTimer?: NodeJS.Timer;
	protected _pingTimeoutTimer?: NodeJS.Timer;

	private readonly _logger: Logger;

	constructor({ connection, webSocket, channelTypes, logLevel = LogLevel.WARNING }: ClientOptions) {
		super();

		const { pingOnInactivity = 60, pingTimeout = 10 } = connection;
		this._pingOnInactivity = pingOnInactivity;
		this._pingTimeout = pingTimeout;
		this._logger = new Logger({ name: 'ircv3', emoji: true, minLevel: logLevel });

		this._connection = webSocket ? new WebSocketConnection(connection) : new DirectConnection(connection);

		this.registerCoreMessageTypes();

		for (const cap of Object.values(CoreCapabilities)) {
			this.registerCapability(cap);
		}

		this._connection.on('connect', () => {
			this._logger.info(`Connection to server ${this._connection.host}:${this._connection.port} established`);
			this.sendMessageAndCaptureReply(CapabilityNegotiation, {
				command: 'LS',
				version: '302'
			}).then((capReply: Message[]) => {
				if (!capReply.length || !(capReply[0] instanceof CapabilityNegotiation)) {
					this._logger.debug1('Server does not support capabilities');
					return;
				}
				this._supportsCapabilities = true;
				const capLists = capReply.map(
					line => ObjectTools.fromArray((line as CapabilityNegotiation).params.capabilities.split(' '), (part: string) => {
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
				this._logger.debug1(`Capabilities supported by server: ${Array.from(this._serverCapabilities.keys()).join(', ')}`);
				const capabilitiesToNegotiate = capLists.map(list => {
					const capNames = Object.keys(list);
					return Array.from(this._clientCapabilities.entries())
						.filter(([name]) => capNames.includes(name))
						.map(([, cap]) => cap);
				});
				this._negotiateCapabilityBatch(capabilitiesToNegotiate).then(() => {
					this.sendMessage(CapabilityNegotiation, { command: 'END' });
					this._registered = true;
					this.emit(this.onRegister);
				});
			});
			if (connection.password) {
				this.sendMessage(Password, { password: connection.password });
			}
			this.sendMessage(NickChange, { nick: this._nick });
			this.sendMessage(UserRegistration, {
				user: this._userName,
				mode: '8',
				unused: '*',
				realName: this._realName
			});
		});

		this._connection.on('lineReceived', (line: string) => {
			this._logger.debug2(`Received message: ${line}`);
			const parsedMessage = Message.parse(line, this._serverProperties, this._registeredMessageTypes);
			this._logger.debug3(`Parsed message: ${JSON.stringify(parsedMessage)}`);
			this._startPingCheckTimer();
			this.handleEvents(parsedMessage);
		});

		this.onMessage(CapabilityNegotiation, ({ params: { command, capabilities } }) => {
			const caps = capabilities.split(' ');

			// tslint:disable-next-line:switch-default
			switch (command.toUpperCase()) {
				case 'NEW': {
					this._logger.debug1(`Server registered new capabilities: ${caps.join(', ')}`);
					const capList = ObjectTools.fromArray<string, ServerCapability, {}>(caps, (part: string) => {
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
					this._logger.debug1(`Server removed capabilities: ${caps.join(', ')}`);
					for (const cap of caps) {
						this._serverCapabilities.delete(cap);
						this._negotiatedCapabilities.delete(cap);
					}
				}
			}
		});

		this.onMessage(Ping, ({ params: { message } }) => {
			this.sendMessage(Pong, { message });
		});

		this.onMessage(Reply001Welcome, () => {
			if (!this._supportsCapabilities) {
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onMessage(Reply004ServerInfo, ({ params: { userModes } }) => {
			if (userModes) {
				this._serverProperties.supportedUserModes = userModes;
			}
		});

		this.onMessage(Reply005ISupport, ({ params: { supports } }) => {
			this._supportedFeatures = {...this._supportedFeatures,
				...ObjectTools.fromArray(supports.split(' '), (part: string) => {
					const [support, param] = part.split('=', 2);
					return { [support]: param || true };
				})
			};
		});

		this.onMessage(Error462AlreadyRegistered, () => {
			// what, I thought we are not registered yet?
			if (!this._registered) {
				// screw this, we are now.
				this._logger.warn('We thought we\'re not registered yet, but we actually are');
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onMessage(PrivateMessage, msg => {
			const { params: { target, message } } = msg;
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

		this.onMessage(Notice, msg => {
			const { params: { target, message } } = msg;
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
			if (this._pingCheckTimer) {
				clearTimeout(this._pingCheckTimer);
			}
			if (this._pingTimeoutTimer) {
				clearTimeout(this._pingTimeoutTimer);
			}
			if (reason) {
				this._logger.err(`Disconnected unexpectedly: ${reason.message}`);
			} else {
				this._logger.info('Disconnected from the server');
			}
			this.emit(this.onDisconnect, reason);
		});

		this._nick = connection.nick;
		this._userName = connection.userName || connection.nick;
		this._realName = connection.realName || connection.nick;

		if (channelTypes) {
			this._serverProperties.channelTypes = channelTypes;
		}
	}

	get serverProperties(): ServerProperties {
		return clone(this._serverProperties, false);
	}

	pingCheck() {
		const now = Date.now();
		const nowStr = now.toString();
		const handler = this.onMessage(Pong, (msg: Pong) => {
			const { params: { message } } = msg;
			if (message === nowStr) {
				this._logger.debug1(`Current ping: ${Date.now() - now}ms`);
				if (this._pingTimeoutTimer) {
					clearTimeout(this._pingTimeoutTimer);
				}
				this.removeMessageListener(handler);
			}
		});
		this._pingTimeoutTimer = setTimeout(
			() => {
				this._logger.warn(`Reconnecting because the last ping took over ${this._pingTimeout} seconds`);
				this.removeMessageListener(handler);
				this.reconnect('Ping timeout');
			},
			this._pingTimeout * 1000
		);
		this.sendMessage(Ping, { message: nowStr });
	}

	async reconnect(message?: string) {
		await this.quit(message);
		return this.connect();
	}

	registerMessageType(cls: MessageConstructor) {
		if (cls.COMMAND !== '') {
			this._logger.debug1(`Registering message type ${cls.COMMAND}`);
			this._registeredMessageTypes.set(cls.COMMAND.toUpperCase(), cls);
		}
	}

	knowsCommand(command: string): boolean {
		return this._registeredMessageTypes.has(command.toUpperCase());
	}

	getCommandClass(command: string): MessageConstructor | undefined {
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

	async connect(): Promise<void> {
		this._supportsCapabilities = false;
		this._negotiatedCapabilities = new Map;
		this._logger.info(`Connecting to ${this._connection.host}:${this._connection.port}`);
		await this._connection.connect();
		this.emit(this.onConnect);
	}

	async waitForRegistration() {
		if (this._registered) {
			return;
		}

		return new Promise<void>((resolve, reject) => {
			let registerListener: Listener;
			let disconnectListener: Listener;
			registerListener = this.onRegister(() => {
				registerListener.unbind();
				disconnectListener.unbind();
				resolve();
			});

			disconnectListener = this.onDisconnect(() => {
				registerListener.unbind();
				disconnectListener.unbind();
				reject();
			});
		});
	}

	protected async _negotiateCapabilityBatch(
		capabilities: ServerCapability[][]
	): Promise<Array<ServerCapability[] | Error>> {
		return Promise.all(capabilities.filter(list => list.length).map(
			async (capList: ServerCapability[]) => this._negotiateCapabilities(capList)
		));
	}

	protected async _negotiateCapabilities(capList: ServerCapability[]): Promise<ServerCapability[] | Error> {
		const mappedCapList: ObjMap<object, ServerCapability> = ObjectTools.fromArray(capList, cap => ({ [cap.name]: cap }));
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
		const negotiatedCapNames = capReply.params.capabilities.split(' ').filter(c => c);
		if (capReply.params.command === 'ACK') {
			// filter is necessary because some networks seem to add trailing spaces...
			this._logger.debug1(`Successfully negotiated capabilities: ${negotiatedCapNames.join(', ')}`);
			const newNegotiatedCaps: ServerCapability[] = negotiatedCapNames.map(capName => (mappedCapList as { [name: string]: ServerCapability })[capName]);
			for (const newCap of newNegotiatedCaps) {
				const mergedCap = this._clientCapabilities.get(newCap.name) as ServerCapability;
				mergedCap.param = newCap.param;
				this._negotiatedCapabilities.set(mergedCap.name, mergedCap);
			}
			return newNegotiatedCaps;
		} else {
			this._logger.debug1(`Failed to negotiate capabilities: ${negotiatedCapNames.join(', ')}`);
			return new Error('capabilities failed to negotiate');
		}
	}

	async registerCapability(cap: Capability) {
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

	send(message: Message): void {
		const line = message.toString();
		this._logger.debug2(`Sending message: ${line}`);
		this._connection.sendLine(line);
	}

	onMessage<C extends MessageConstructor>(type: C, handler: EventHandler<ConstructedType<C>>, handlerName?: string): string;
	onMessage<T extends Message>(type: string, handler: EventHandler, handlerName?: string): string;
	onMessage<T extends Message>(
		type: typeof Message | string,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
		const commandName = typeof type === 'string' ? type : type.COMMAND;
		if (!this._events.has(commandName)) {
			this._events.set(commandName, new Map);
		}

		const handlerList: Map<string, EventHandler<T>> = this._events.get(commandName)!;

		if (!handlerName) {
			do {
				handlerName = `${commandName}:${padLeft(Math.random() * 10000, 4, '0')}`;
			} while (handlerList.has(handlerName));
		}

		handlerList.set(handlerName, handler);

		return handlerName;
	}

	removeMessageListener(handlerName: string) {
		const [commandName] = handlerName.split(':');
		if (!this._events.has(commandName)) {
			return;
		}

		this._events.get(commandName)!.delete(handlerName);
	}

	createMessage<T extends MessageConstructor>(
		type: T,
		params: MessageParams<ConstructedType<T>>
	): ConstructedType<T> {
		return type.create(params, this.serverProperties) as ConstructedType<T>;
	}

	sendMessage<T extends MessageConstructor>(
		type: T,
		params: MessageParams<ConstructedType<T>>
	): void {
		this.send(this.createMessage(type, params));
	}

	async sendMessageAndCaptureReply<T extends Message>(
		type: MessageConstructor<T>,
		params: MessageParams<T>
	): Promise<Message[]> {
		if (!type.SUPPORTS_CAPTURE) {
			throw new Error(`The command "${type.COMMAND}" does not support reply capture`);
		}

		const message = this.createMessage(type, params);
		const promise = this.collect(message).promise();
		this.send(message);
		return promise;
	}

	get isConnected() {
		return this._connection.isConnected;
	}

	get isConnecting() {
		return this._connection.isConnecting;
	}

	get isRegistered() {
		return this._registered;
	}

	/** @private */
	collect(originalMessage: Message, ...types: MessageConstructor[]) {
		const collector = new MessageCollector(this, originalMessage, ...types);
		this._collectors.push(collector);
		return collector;
	}

	/** @private */
	stopCollect(collector: MessageCollector): void {
		this._collectors.splice(this._collectors.findIndex(value => value === collector), 1);
	}

	// convenience methods
	join(channel: string, key?: string) {
		this.sendMessage(ChannelJoin, { channel, key });
	}

	part(channel: string) {
		this.sendMessage(ChannelPart, { channel });
	}

	async quit(message?: string) {
		return new Promise<void>(resolve => {
			const handler = () => {
				this._connection.removeListener('disconnect', handler);
				resolve();
			};
			this._connection.addListener('disconnect', handler);
			this.sendMessage(ClientQuit, { message });
			this._connection.disconnect();
		});
	}

	say(target: string, message: string) {
		this.sendMessage(PrivateMessage, { target, message });
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
		if (this._pingCheckTimer) {
			clearTimeout(this._pingCheckTimer);
		}
		this._pingCheckTimer = setTimeout(
			() => this.pingCheck(),
			this._pingOnInactivity * 1000
		);
	}
}
