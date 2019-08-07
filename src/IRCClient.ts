import Logger, { LogLevel } from '@d-fischer/logger';
import { EventEmitter, Listener } from '@d-fischer/typed-event-emitter';
import * as clone from 'clone';

import Capability, { ServerCapability } from './Capability/Capability';
import * as CoreCapabilities from './Capability/CoreCapabilities';
import Connection, { ConnectionInfo } from './Connection/Connection';
import DirectConnection from './Connection/DirectConnection';
import WebSocketConnection from './Connection/WebSocketConnection';
import Message, { createMessage, MessageConstructor, MessageParamValues } from './Message/Message';
import MessageCollector from './Message/MessageCollector';
import { parseMessage } from './Message/MessageParser';
import * as MessageTypes from './Message/MessageTypes';
import {
	CapabilityNegotiation,
	ChannelJoin,
	ChannelPart,
	NickChange,
	Notice,
	Password,
	Ping,
	Pong,
	PrivateMessage,
	UserRegistration
} from './Message/MessageTypes/Commands';
import ClientQuit from './Message/MessageTypes/Commands/ClientQuit';
import {
	Error462AlreadyRegistered,
	Reply001Welcome,
	Reply004ServerInfo,
	Reply005ISupport
} from './Message/MessageTypes/Numerics';
import { defaultServerProperties, ServerProperties } from './ServerProperties';
import MessageError from './Errors/MessageError';
import { NonEnumerable } from './Toolkit/NonEnumerable';
import ObjectTools, { ObjMap } from './Toolkit/ObjectTools';
import { decodeCtcp, padLeft, splitWithLimit } from './Toolkit/StringTools';
import { ConstructedType } from './Toolkit/TypeTools';

export type EventHandler<T extends Message = Message> = (message: T) => void;
export type EventHandlerList<T extends Message = Message> = Map<string, EventHandler<T>>;

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IRCCredentials {
	nick: string;
	password?: string;
	userName?: string;
	realName?: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IRCClientOptions {
	connection: ConnectionInfo;
	credentials: IRCCredentials;
	webSocket?: boolean;
	channelTypes?: string;
	logLevel?: LogLevel;
	nonConformingCommands?: string[];
}

export default class IRCClient extends EventEmitter {
	protected _connection: Connection;
	protected _registered: boolean = false;

	@NonEnumerable protected _credentials: IRCCredentials;

	protected _supportsCapabilities: boolean = true;

	protected _events: Map<string, EventHandlerList> = new Map();
	protected _registeredMessageTypes: Map<string, MessageConstructor> = new Map();

	// emitted events
	onConnect: (handler: () => void) => Listener = this.registerEvent();
	onRegister: (handler: () => void) => Listener = this.registerEvent();
	onDisconnect: (handler: (reason?: Error) => void) => Listener = this.registerEvent();

	onPrivmsg: (
		handler: (target: string, user: string, message: string, msg: PrivateMessage) => void
	) => Listener = this.registerEvent();
	onAction: (
		handler: (target: string, user: string, message: string, msg: PrivateMessage) => void
	) => Listener = this.registerEvent();
	onNotice: (
		handler: (target: string, user: string, message: string, msg: Notice) => void
	) => Listener = this.registerEvent();

	onNickChange = this.registerEvent<(oldNick: string | undefined, newNick: string, msg: NickChange) => void>();

	onCtcp: (
		handler: (target: string, user: string, command: string, params: string, msg: PrivateMessage) => void
	) => Listener = this.registerEvent();
	onCtcpReply: (
		handler: (target: string, user: string, command: string, params: string, msg: Notice) => void
	) => Listener = this.registerEvent();

	protected _serverProperties: ServerProperties = clone(defaultServerProperties, false);
	protected _supportedFeatures: { [feature: string]: true | string } = {};
	protected _collectors: MessageCollector[] = [];

	protected _clientCapabilities: Map<string, Capability> = new Map();
	protected _serverCapabilities: Map<string, ServerCapability> = new Map();
	protected _negotiatedCapabilities: Map<string, ServerCapability> = new Map();

	protected _pingOnInactivity: number;
	protected _pingTimeout: number;
	protected _pingCheckTimer?: NodeJS.Timer;
	protected _pingTimeoutTimer?: NodeJS.Timer;

	protected _currentNick: string;

	private readonly _logger: Logger;

	constructor({
		connection,
		credentials,
		webSocket,
		channelTypes,
		logLevel = LogLevel.WARNING,
		nonConformingCommands = []
	}: IRCClientOptions) {
		super();

		const { pingOnInactivity = 60, pingTimeout = 10 } = connection;
		this._pingOnInactivity = pingOnInactivity;
		this._pingTimeout = pingTimeout;

		this._currentNick = credentials.nick;

		this._logger = new Logger({ name: 'ircv3', emoji: true, minLevel: logLevel });

		this._connection = webSocket ? new WebSocketConnection(connection) : new DirectConnection(connection);

		this.registerCoreMessageTypes();

		for (const cap of Object.values(CoreCapabilities)) {
			this.registerCapability(cap);
		}

		this._connection.on('connect', () => {
			this._logger.info(`Connection to server ${this._connection.host}:${this._connection.port} established`);
			this.sendMessageAndCaptureReply(CapabilityNegotiation, {
				subCommand: 'LS',
				version: '302'
			}).then((capReply: Message[]) => {
				if (!capReply.length || !(capReply[0] instanceof CapabilityNegotiation)) {
					this._logger.debug1('Server does not support capabilities');
					return;
				}
				this._supportsCapabilities = true;
				const capLists = capReply.map(line =>
					ObjectTools.fromArray(
						(line as CapabilityNegotiation).params.capabilities.split(' '),
						(part: string) => {
							if (!part) {
								return {};
							}
							const [cap, param] = splitWithLimit(part, '=', 2);
							return {
								[cap]: {
									name: cap,
									param: param || true
								}
							};
						}
					)
				);
				this._serverCapabilities = new Map<string, ServerCapability>(
					Object.entries(Object.assign({}, ...capLists))
				);
				this._logger.debug1(
					`Capabilities supported by server: ${Array.from(this._serverCapabilities.keys()).join(', ')}`
				);
				const capabilitiesToNegotiate = capLists.map(list => {
					const capNames = Object.keys(list);
					return Array.from(this._clientCapabilities.entries())
						.filter(([name]) => capNames.includes(name))
						.map(([, cap]) => cap);
				});
				this._negotiateCapabilityBatch(capabilitiesToNegotiate).then(() => {
					this.sendMessage(CapabilityNegotiation, { subCommand: 'END' });
					this._registered = true;
					this.emit(this.onRegister);
				});
			});
			if (this._credentials.password) {
				this.sendMessage(Password, { password: this._credentials.password });
			}
			this.sendMessage(NickChange, { nick: this._credentials.nick });
			this.sendMessage(UserRegistration, {
				user: this._credentials.userName || this._credentials.nick,
				mode: '8',
				unused: '*',
				realName: this._credentials.realName || this._credentials.nick
			});
		});

		this._connection.on('lineReceived', (line: string) => {
			this._logger.debug2(`Received message: ${line}`);
			let parsedMessage;
			try {
				parsedMessage = parseMessage(
					line,
					this._serverProperties,
					this._registeredMessageTypes,
					true,
					nonConformingCommands
				);
			} catch (e) {
				this._logger.err(`Error parsing message: ${e.message}`);
				this._logger.debug1(e.stack);
				return;
			}
			this._logger.debug3(`Parsed message: ${JSON.stringify(parsedMessage)}`);
			this._startPingCheckTimer();
			this.handleEvents(parsedMessage);
		});

		this.onMessage(CapabilityNegotiation, ({ params: { subCommand, capabilities } }) => {
			const caps = capabilities.split(' ');

			// eslint-disable-next-line default-case
			switch (subCommand.toUpperCase()) {
				case 'NEW': {
					this._logger.debug1(`Server registered new capabilities: ${caps.join(', ')}`);
					const capList = ObjectTools.fromArray<string, ServerCapability, {}>(caps, (part: string) => {
						if (!part) {
							return {};
						}
						const [cap, param] = splitWithLimit(part, '=', 2);
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
					this._negotiateCapabilities(
						Array.from(this._clientCapabilities.entries())
							.filter(([name]) => capNames.includes(name))
							.map(([, cap]) => cap)
					);
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
			const newFeatures = ObjectTools.fromArray(supports.split(' '), (part: string) => {
				const [support, param] = splitWithLimit(part, '=', 2);
				return { [support]: param || true };
			});
			this._supportedFeatures = {
				...this._supportedFeatures,
				...newFeatures
			};
		});

		this.onMessage(Error462AlreadyRegistered, () => {
			// what, I thought we are not registered yet?
			if (!this._registered) {
				// screw this, we are now.
				this._logger.warn("We thought we're not registered yet, but we actually are");
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onMessage(PrivateMessage, msg => {
			const {
				params: { target, message }
			} = msg;
			const ctcpMessage = decodeCtcp(message);
			const nick = msg.prefix && msg.prefix.nick;

			if (ctcpMessage) {
				if (ctcpMessage.command === 'ACTION') {
					this.emit(this.onAction, target, nick, ctcpMessage.params, msg);
				} else {
					this.emit(this.onCtcp, target, nick, ctcpMessage.command, ctcpMessage.params, msg);
				}
			} else {
				this.emit(this.onPrivmsg, target, nick, message, msg);
			}
		});

		this.onMessage(NickChange, msg => {
			const {
				params: { nick: newNick }
			} = msg;

			const oldNick = msg.prefix && msg.prefix.nick;

			if (oldNick === this._currentNick) {
				this._currentNick = newNick;
			}

			this.emit(this.onNickChange, oldNick, newNick, msg);
		});

		this.onMessage(Notice, msg => {
			const {
				params: { target, message }
			} = msg;
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

		this._credentials = { ...credentials };

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
			const {
				params: { message }
			} = msg;
			if (message === nowStr) {
				this._logger.debug1(`Current ping: ${Date.now() - now}ms`);
				if (this._pingTimeoutTimer) {
					clearTimeout(this._pingTimeoutTimer);
				}
				this.removeMessageListener(handler);
			}
		});
		this._pingTimeoutTimer = setTimeout(() => {
			this._logger.warn(`Reconnecting because the last ping took over ${this._pingTimeout} seconds`);
			this.removeMessageListener(handler);
			this.reconnect('Ping timeout');
		}, this._pingTimeout * 1000);
		this.sendMessage(Ping, { message: nowStr });
	}

	async reconnect(message?: string) {
		this.quit(message);
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

	async connect(): Promise<void> {
		this._supportsCapabilities = false;
		this._negotiatedCapabilities = new Map();
		this._currentNick = this._credentials.nick;
		this._logger.info(`Connecting to ${this._connection.host}:${this._connection.port}`);
		await this._connection.connect();
		this.emit(this.onConnect);
	}

	async waitForRegistration() {
		if (this._registered) {
			return undefined;
		}

		return new Promise<void>((resolve, reject) => {
			let errorListener: string;
			let disconnectListener: Listener;

			const registerListener = this.onRegister(() => {
				registerListener.unbind();
				this.removeMessageListener(errorListener);
				disconnectListener.unbind();
				resolve();
			});

			errorListener = this.onMessage(MessageTypes.Commands.ErrorMessage, msg => {
				registerListener.unbind();
				this.removeMessageListener(errorListener);
				disconnectListener.unbind();
				reject(new MessageError(msg));
			});

			disconnectListener = this.onDisconnect(reason => {
				registerListener.unbind();
				this.removeMessageListener(errorListener);
				disconnectListener.unbind();
				reject(reason);
			});
		});
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
		this.sendRaw(message.toString());
	}

	sendRaw(line: string) {
		this._logger.debug2(`Sending message: ${line}`);
		this._connection.sendLine(line);
	}

	onMessage<C extends MessageConstructor>(
		type: C,
		handler: EventHandler<ConstructedType<C>>,
		handlerName?: string
	): string;
	onMessage<T extends Message>(type: string, handler: EventHandler, handlerName?: string): string;
	onMessage<T extends Message>(
		type: typeof Message | string,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
		const commandName = typeof type === 'string' ? type : type.COMMAND;
		if (!this._events.has(commandName)) {
			this._events.set(commandName, new Map());
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

	createMessage<T extends Message<T, X>, X extends Exclude<keyof T, keyof Message>>(
		type: MessageConstructor<T, X>,
		params: Partial<MessageParamValues<T>>,
		tags?: Map<string, string>
	) {
		return createMessage(type, params, undefined, tags, this.serverProperties);
	}

	sendMessage<T extends Message<T, X>, X extends Exclude<keyof T, keyof Message>>(
		type: MessageConstructor<T, X>,
		params: Partial<MessageParamValues<T>>
	): void {
		this.send(this.createMessage(type, params));
	}

	async sendMessageAndCaptureReply<T extends Message<T, X>, X extends Exclude<keyof T, keyof Message>>(
		type: MessageConstructor<T, X>,
		params: Partial<MessageParamValues<T>>
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

	get currentNick() {
		return this._currentNick;
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

	quit(message?: string) {
		this.sendMessage(ClientQuit, { message });
		this._connection.disconnect();
	}

	say(target: string, message: string) {
		this.sendMessage(PrivateMessage, { target, message });
	}

	sendCTCP(target: string, type: string, message: string) {
		this.say(target, `\x01${type.toUpperCase()} ${message}\x01`);
	}

	action(target: string, message: string) {
		this.sendCTCP(target, 'ACTION', message);
	}

	protected registerCoreMessageTypes() {
		ObjectTools.forEach(MessageTypes.Commands, (type: MessageConstructor) => {
			this.registerMessageType(type);
		});

		ObjectTools.forEach(MessageTypes.Numerics, (type: MessageConstructor) => {
			this.registerMessageType(type);
		});
	}

	protected async _negotiateCapabilityBatch(
		capabilities: ServerCapability[][]
	): Promise<Array<ServerCapability[] | Error>> {
		return Promise.all(
			capabilities
				.filter(list => list.length)
				.map(async (capList: ServerCapability[]) => this._negotiateCapabilities(capList))
		);
	}

	protected async _negotiateCapabilities(capList: ServerCapability[]): Promise<ServerCapability[] | Error> {
		const mappedCapList: ObjMap<object, ServerCapability> = ObjectTools.fromArray(capList, cap => ({
			[cap.name]: cap
		}));
		const messages = await this.sendMessageAndCaptureReply(CapabilityNegotiation, {
			subCommand: 'REQ',
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
		if (capReply.params.subCommand === 'ACK') {
			// filter is necessary because some networks seem to add trailing spaces...
			this._logger.debug1(`Successfully negotiated capabilities: ${negotiatedCapNames.join(', ')}`);
			const newNegotiatedCaps: ServerCapability[] = negotiatedCapNames.map(
				capName => (mappedCapList as { [name: string]: ServerCapability })[capName]
			);
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

	protected _updateCredentials(newCredentials: Partial<IRCCredentials>) {
		this._credentials = { ...this._credentials, ...newCredentials };
	}

	// event helper
	private handleEvents(message: Message): void {
		this._collectors.some(collector => collector.collect(message));

		const handlers: EventHandlerList | undefined = this._events.get(
			(message.constructor as MessageConstructor).COMMAND
		);
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
		this._pingCheckTimer = setTimeout(() => this.pingCheck(), this._pingOnInactivity * 1000);
	}
}
