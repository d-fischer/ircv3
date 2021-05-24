import type { Connection, ConnectionInfo, ConnectionOptions, WebSocketConnectionOptions } from '@d-fischer/connection';
import { DirectConnection, PersistentConnection, WebSocketConnection } from '@d-fischer/connection';
import type { Logger, LoggerOptionsOrCustom } from '@d-fischer/logger';
import { createLogger } from '@d-fischer/logger';
import type { Constructor, ResolvableValue } from '@d-fischer/shared-utils';
import {
	arrayToObject,
	Enumerable,
	forEachObjectEntry,
	padLeft,
	resolveConfigValue,
	splitWithLimit
} from '@d-fischer/shared-utils';
import type { Listener, EventBinder } from '@d-fischer/typed-event-emitter';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { klona } from 'klona/json';

import type { Capability, ServerCapability } from './Capability/Capability';
import * as CoreCapabilities from './Capability/CoreCapabilities';
import { MessageError } from './Errors/MessageError';
import type { Message, MessageConstructor, MessageParamValues } from './Message/Message';
import { createMessage } from './Message/Message';
import { MessageCollector } from './Message/MessageCollector';
import { parseMessage } from './Message/MessageParser';
import * as MessageTypes from './Message/MessageTypes';
import {
	CapabilityNegotiation,
	ChannelJoin,
	ChannelPart,
	ClientQuit,
	ErrorMessage,
	NickChange,
	Notice,
	Password,
	Ping,
	Pong,
	PrivateMessage,
	UserRegistration
} from './Message/MessageTypes/Commands';
import {
	Error422NoMotd,
	Error462AlreadyRegistered,
	Reply001Welcome,
	Reply004ServerInfo,
	Reply005Isupport,
	Reply376EndOfMotd
} from './Message/MessageTypes/Numerics';
import type { ServerProperties } from './ServerProperties';
import { defaultServerProperties } from './ServerProperties';
import { decodeCtcp } from './Toolkit/StringTools';

export type EventHandler<T extends Message = Message> = (message: T) => void;
export type EventHandlerList<T extends Message = Message> = Map<string, EventHandler<T>>;

export interface IrcCredentials {
	nick: string;
	password?: string;
	userName?: string;
	realName?: string;
}

export interface IrcClientConnectionOptions {
	hostName: string;
	port?: number;
	secure?: boolean;
	pingOnInactivity?: number;
	pingTimeout?: number;
	reconnect?: boolean;
}

export interface BaseIrcClientOptions {
	connection: IrcClientConnectionOptions;
	credentials: IrcCredentials;
	channels?: ResolvableValue<string[]>;
	webSocket?: boolean;
	channelTypes?: string;
	logger?: Partial<LoggerOptionsOrCustom>;
	nonConformingCommands?: string[];
}

export interface WebSocketIrcClientOptions extends BaseIrcClientOptions {
	webSocket: true;
	connectionOptions?: WebSocketConnectionOptions;
}

export interface TcpIrcClientOptions extends BaseIrcClientOptions {
	webSocket?: false;
	connectionOptions?: never;
}

export type IrcClientOptions = WebSocketIrcClientOptions | TcpIrcClientOptions;

export class IrcClient extends EventEmitter {
	protected _connection: Connection;
	protected _registered: boolean = false;

	@Enumerable(false) protected _options: IrcClientOptions;
	@Enumerable(false) protected _credentials: IrcCredentials;

	protected _supportsCapabilities: boolean = true;

	protected _events = new Map<string, EventHandlerList>();
	protected _registeredMessageTypes = new Map<string, MessageConstructor>();

	// emitted events
	onConnect: EventBinder<[]> = this.registerEvent();
	onRegister: EventBinder<[]> = this.registerEvent();
	onDisconnect: EventBinder<[manually: boolean, reason?: Error]> = this.registerEvent();

	onPrivmsg: EventBinder<[target: string, user: string, message: string, msg: PrivateMessage]> = this.registerEvent();
	onAction: EventBinder<[target: string, user: string, message: string, msg: PrivateMessage]> = this.registerEvent();
	onNotice: EventBinder<[target: string, user: string, message: string, msg: Notice]> = this.registerEvent();

	onNickChange: EventBinder<[oldNick: string | undefined, newNick: string, msg: NickChange]> = this.registerEvent();

	onCtcp: EventBinder<
		[target: string, user: string, command: string, params: string, msg: PrivateMessage]
	> = this.registerEvent();
	onCtcpReply: EventBinder<
		[target: string, user: string, command: string, params: string, msg: Notice]
	> = this.registerEvent();

	onAnyMessage: EventBinder<[msg: Message]> = this.registerEvent();

	protected _serverProperties: ServerProperties = klona(defaultServerProperties);
	protected _supportedFeatures: Record<string, true | string> = {};
	protected _collectors: MessageCollector[] = [];

	protected _clientCapabilities = new Map<string, Capability>();
	protected _serverCapabilities = new Map<string, ServerCapability>();
	protected _negotiatedCapabilities = new Map<string, ServerCapability>();

	protected _pingOnInactivity: number;
	protected _pingTimeout: number;
	protected _pingCheckTimer?: NodeJS.Timer;
	protected _pingTimeoutTimer?: NodeJS.Timer;

	protected _currentNick: string;

	private readonly _logger: Logger;
	private _initialConnectionSetupDone = false;

	constructor(options: IrcClientOptions) {
		super();

		const { connection, credentials, channels, channelTypes, webSocket, logger = {} } = options;

		this._options = options;

		const { pingOnInactivity = 60, pingTimeout = 10 } = connection;
		this._pingOnInactivity = pingOnInactivity;
		this._pingTimeout = pingTimeout;

		this._currentNick = credentials.nick;

		this._logger = createLogger({ name: 'ircv3', emoji: true, ...logger });

		this.registerCoreMessageTypes();

		const { hostName, secure, reconnect = true } = connection;

		const connectionOptions: ConnectionInfo = {
			hostName,
			port: this.port,
			secure,
			lineBased: true
		};

		const ConnectionType: Constructor<Connection> = webSocket ? WebSocketConnection : DirectConnection;
		if (reconnect) {
			this._connection = new PersistentConnection(
				ConnectionType,
				connectionOptions,
				{ logger: this._logger },
				options.connectionOptions as ConnectionOptions<Connection>
			);
		} else {
			this._connection = new ConnectionType(connectionOptions, this._logger, options.connectionOptions);
		}

		for (const cap of Object.values(CoreCapabilities)) {
			this.addCapability(cap);
		}

		if (channels) {
			this.onRegister(async () => {
				const resolvedChannels = await resolveConfigValue(channels);
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (resolvedChannels) {
					for (const channel of resolvedChannels) {
						this.join(channel);
					}
				}
			});
		}

		this.onTypedMessage(CapabilityNegotiation, async ({ params: { subCommand, capabilities } }) => {
			const caps = capabilities.split(' ');

			// eslint-disable-next-line default-case
			switch (subCommand.toUpperCase()) {
				case 'NEW': {
					this._logger.debug(`Server registered new capabilities: ${caps.join(', ')}`);
					const capList = arrayToObject<string, ServerCapability, unknown>(caps, (part: string) => {
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
					await this._negotiateCapabilities(
						Array.from(this._clientCapabilities.entries())
							.filter(([name]) => capNames.includes(name))
							.map(([, cap]) => cap)
					);
					break;
				}

				case 'DEL': {
					this._logger.debug(`Server removed capabilities: ${caps.join(', ')}`);
					for (const cap of caps) {
						this._serverCapabilities.delete(cap);
						this._negotiatedCapabilities.delete(cap);
					}
				}
			}
		});

		this.onTypedMessage(Ping, ({ params: { message } }) => {
			this.sendMessage(Pong, { message });
		});

		this.onTypedMessage(Reply001Welcome, ({ params: { me } }) => {
			this._handleReceivedClientNick(me);
		});

		this.onTypedMessage(Reply004ServerInfo, ({ params: { userModes } }) => {
			if (userModes) {
				this._serverProperties.supportedUserModes = userModes;
			}
		});

		this.onTypedMessage(Reply005Isupport, ({ params: { supports } }) => {
			const newFeatures = arrayToObject(supports.split(' '), (part: string) => {
				const [support, param] = splitWithLimit(part, '=', 2);
				return { [support]: param || true };
			});
			this._supportedFeatures = {
				...this._supportedFeatures,
				...newFeatures
			};
		});

		this.onTypedMessage(Reply376EndOfMotd, ({ params: { me } }) => {
			if (!this._registered) {
				this._handleReceivedClientNick(me);
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onTypedMessage(Error422NoMotd, ({ params: { me } }) => {
			if (!this._registered) {
				this._handleReceivedClientNick(me);
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onTypedMessage(Error462AlreadyRegistered, ({ params: { me } }) => {
			// what, I thought we are not registered yet?
			if (!this._registered) {
				// screw this, we are now.
				this._logger.warn("We thought we're not registered yet, but we actually are");
				this._handleReceivedClientNick(me);
				this._registered = true;
				this.emit(this.onRegister);
			}
		});

		this.onTypedMessage(PrivateMessage, msg => {
			const {
				params: { target, content }
			} = msg;
			const ctcpMessage = decodeCtcp(content);
			const nick = msg.prefix?.nick;

			if (ctcpMessage) {
				if (ctcpMessage.command === 'ACTION') {
					this.emit(this.onAction, target, nick, ctcpMessage.params, msg);
				} else {
					this.emit(this.onCtcp, target, nick, ctcpMessage.command, ctcpMessage.params, msg);
				}
			} else {
				this.emit(this.onPrivmsg, target, nick, content, msg);
			}
		});

		this.onTypedMessage(NickChange, msg => {
			const {
				params: { nick: newNick }
			} = msg;

			const oldNick = msg.prefix?.nick;

			if (oldNick === this._currentNick) {
				this._currentNick = newNick;
			}

			this.emit(this.onNickChange, oldNick, newNick, msg);
		});

		this.onTypedMessage(Notice, msg => {
			const {
				params: { target, content }
			} = msg;
			const ctcpMessage = decodeCtcp(content);
			const nick = msg.prefix?.nick;

			if (ctcpMessage) {
				this.emit(this.onCtcpReply, target, nick, ctcpMessage.command, ctcpMessage.params, msg);
			}

			this.emit(this.onNotice, target, nick, content, msg);
		});

		this.onRegister(() => this._startPingCheckTimer());

		this._credentials = { ...credentials };

		if (channelTypes) {
			this._serverProperties.channelTypes = channelTypes;
		}
	}

	receiveLine(line: string): void {
		this._logger.debug(`Received message: ${line}`);
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let parsedMessage;
		try {
			parsedMessage = parseMessage(
				line,
				this._serverProperties,
				this._registeredMessageTypes,
				true,
				this._options.nonConformingCommands
			);
		} catch (e: unknown) {
			this._logger.error(`Error parsing message: ${(e as Error).message}`);
			this._logger.trace((e as Error).stack ?? 'No stack available');
			return;
		}
		this._logger.trace(`Parsed message: ${JSON.stringify(parsedMessage)}`);
		this._startPingCheckTimer();
		this.emit(this.onAnyMessage, parsedMessage);
		this._handleEvents(parsedMessage);
	}

	get serverProperties(): ServerProperties {
		return klona(this._serverProperties);
	}

	get port(): number {
		const {
			webSocket,
			connection: { port, secure }
		} = this._options;

		if (port) {
			return port;
		}

		if (webSocket) {
			return secure ? 443 : 80;
		}

		return secure ? 6697 : 6667;
	}

	pingCheck(): void {
		const now = Date.now();
		const nowStr = now.toString();
		const handler = this.onTypedMessage(Pong, (msg: Pong) => {
			const {
				params: { message }
			} = msg;
			if (message === nowStr) {
				this._logger.debug(`Current ping: ${Date.now() - now}ms`);
				if (this._pingTimeoutTimer) {
					clearTimeout(this._pingTimeoutTimer);
				}
				this.removeMessageListener(handler);
			}
		});
		this._pingTimeoutTimer = setTimeout(async () => {
			this.removeMessageListener(handler);
			// eslint-disable-next-line no-restricted-syntax
			if (this._options.connection.reconnect === false) {
				this._logger.error(`Disconnecting because the last ping took over ${this._pingTimeout} seconds`);
			} else {
				this._logger.warn(`Reconnecting because the last ping took over ${this._pingTimeout} seconds`);
			}
			this._connection.assumeExternalDisconnect();
		}, this._pingTimeout * 1000);
		this.sendMessage(Ping, { message: nowStr });
	}

	async reconnect(message?: string): Promise<void> {
		await this.quit(message);
		return this.connect();
	}

	registerMessageType(cls: MessageConstructor): void {
		if (cls.COMMAND !== '') {
			this._logger.trace(`Registering message type ${cls.COMMAND}`);
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
		this._negotiatedCapabilities = new Map<string, ServerCapability>();
		this._currentNick = this._credentials.nick;
		await this._setupConnection();
		this._logger.info(`Connecting to ${this._connection.host}:${this._connection.port}`);
		await this._connection.connect();
		this.emit(this.onConnect);
	}

	async waitForRegistration(): Promise<void> {
		if (this._registered) {
			return undefined;
		}

		return new Promise<void>((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/init-declarations
			let errorListener: string;
			// eslint-disable-next-line @typescript-eslint/init-declarations
			let disconnectListener: Listener;

			const registerListener = this.onRegister(() => {
				registerListener.unbind();
				this.removeMessageListener(errorListener);
				disconnectListener.unbind();
				resolve();
			});

			errorListener = this.onTypedMessage(ErrorMessage, msg => {
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

	addCapability(cap: Capability): void {
		this._clientCapabilities.set(cap.name, cap);

		if (cap.messageTypes) {
			for (const messageType of cap.messageTypes) {
				this.registerMessageType(messageType);
			}
		}
	}

	async registerCapability(cap: Capability): Promise<ServerCapability[] | Error> {
		this.addCapability(cap);

		if (this._serverCapabilities.has(cap.name)) {
			return this._negotiateCapabilities([cap]);
		}

		return [];
	}

	send(message: Message): void {
		this.sendRaw(message.toString());
	}

	sendRaw(line: string): void {
		if (this._connection.isConnected) {
			this._logger.debug(`Sending message: ${line}`);
			this._connection.sendLine(line);
		}
	}

	onNamedMessage<T extends Message = Message>(
		commandName: string,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
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

	onTypedMessage<T extends Message>(
		type: MessageConstructor<T>,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
		return this.onNamedMessage<T>(type.COMMAND, handler, handlerName);
	}

	removeMessageListener(handlerName: string): void {
		const [commandName] = handlerName.split(':');
		if (!this._events.has(commandName)) {
			return;
		}

		this._events.get(commandName)!.delete(handlerName);
	}

	createMessage<T extends Message<T>>(
		type: MessageConstructor<T>,
		params: Partial<MessageParamValues<T>>,
		tags?: Record<string, string>
	): T {
		const tagsMap = tags ? new Map(Object.entries(tags)) : undefined;
		return createMessage(type, params, undefined, tagsMap, this.serverProperties);
	}

	sendMessage<T extends Message<T>>(
		type: MessageConstructor<T>,
		params: Partial<MessageParamValues<T>>,
		tags?: Record<string, string>
	): void {
		this.send(this.createMessage(type, params, tags));
	}

	async sendMessageAndCaptureReply<T extends Message<T>>(
		type: MessageConstructor<T>,
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

	get isConnected(): boolean {
		return this._connection.isConnected;
	}

	get isConnecting(): boolean {
		return this._connection.isConnecting;
	}

	get isRegistered(): boolean {
		return this._registered;
	}

	get currentNick(): string {
		return this._currentNick;
	}

	/** @private */
	collect(originalMessage: Message, ...types: MessageConstructor[]): MessageCollector {
		const collector = new MessageCollector(this, originalMessage, ...types);
		this._collectors.push(collector);
		return collector;
	}

	/** @private */
	stopCollect(collector: MessageCollector): void {
		this._collectors.splice(
			this._collectors.findIndex(value => value === collector),
			1
		);
	}

	// convenience methods
	join(channel: string, key?: string): void {
		this.sendMessage(ChannelJoin, { channel, key });
	}

	part(channel: string): void {
		this.sendMessage(ChannelPart, { channel });
	}

	async quit(message?: string): Promise<void> {
		this.sendMessage(ClientQuit, { message });
		void this._connection.disconnect().then(() => {
			this._logger.debug('Finished cleaning up old connection');
		});
	}

	say(target: string, message: string, tags: Record<string, string> = {}): void {
		this.sendMessage(PrivateMessage, { target, content: message }, tags);
	}

	sendCtcp(target: string, type: string, message: string): void {
		this.say(target, `\x01${type.toUpperCase()} ${message}\x01`);
	}

	action(target: string, message: string): void {
		this.sendCtcp(target, 'ACTION', message);
	}

	protected async getPassword(currentPassword?: string): Promise<string | undefined> {
		return currentPassword;
	}

	protected registerCoreMessageTypes(): void {
		forEachObjectEntry(MessageTypes.Commands, (type: MessageConstructor) => {
			this.registerMessageType(type);
		});

		forEachObjectEntry(MessageTypes.Numerics, (type: MessageConstructor) => {
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
		const mappedCapList: Record<string, ServerCapability> = arrayToObject(capList, cap => ({
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
			this._logger.debug(`Successfully negotiated capabilities: ${negotiatedCapNames.join(', ')}`);
			const newNegotiatedCaps: ServerCapability[] = negotiatedCapNames.map(capName => mappedCapList[capName]);
			for (const newCap of newNegotiatedCaps) {
				const mergedCap = this._clientCapabilities.get(newCap.name) as ServerCapability;
				mergedCap.param = newCap.param;
				this._negotiatedCapabilities.set(mergedCap.name, mergedCap);
			}
			return newNegotiatedCaps;
		} else {
			this._logger.warn(`Failed to negotiate capabilities: ${negotiatedCapNames.join(', ')}`);
			return new Error('capabilities failed to negotiate');
		}
	}

	protected _updateCredentials(newCredentials: Partial<IrcCredentials>): void {
		this._credentials = { ...this._credentials, ...newCredentials };
	}

	private async _setupConnection() {
		if (this._initialConnectionSetupDone) {
			return;
		}
		this._connection.onConnect(async () => {
			this._logger.info(`Connection to server ${this._connection.host}:${this._connection.port} established`);
			this._logger.debug('Determining connection password');
			const [password] = await Promise.all([
				this.getPassword(this._credentials.password),
				this.sendMessageAndCaptureReply(CapabilityNegotiation, {
					subCommand: 'LS',
					version: '302'
				})
					.then<Array<ServerCapability[] | Error>>((capReply: Message[]) => {
						if (!capReply.length || !(capReply[0] instanceof CapabilityNegotiation)) {
							this._logger.debug('Server does not support capabilities');
							return [];
						}
						this._supportsCapabilities = true;
						const capLists = capReply.map(line =>
							arrayToObject(
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
						this._logger.debug(
							`Capabilities supported by server: ${Array.from(this._serverCapabilities.keys()).join(
								', '
							)}`
						);
						const capabilitiesToNegotiate = capLists.map(list => {
							const capNames = Object.keys(list);
							return Array.from(this._clientCapabilities.entries())
								.filter(([name]) => capNames.includes(name))
								.map(([, cap]) => cap);
						});
						return this._negotiateCapabilityBatch(capabilitiesToNegotiate);
					})
					.then(() => {
						this.sendMessage(CapabilityNegotiation, { subCommand: 'END' });
					})
			]);
			if (password && password !== this._credentials.password) {
				this._updateCredentials({ password });
			}
			if (password) {
				this.sendMessage(Password, { password });
			}
			this.sendMessage(NickChange, { nick: this._credentials.nick });
			this.sendMessage(UserRegistration, {
				user: this._credentials.userName ?? this._credentials.nick,
				mode: '8',
				unused: '*',
				realName: this._credentials.realName ?? this._credentials.nick
			});
		});

		this._initialConnectionSetupDone = true;

		this._connection.onReceive((line: string) => {
			this.receiveLine(line);
		});

		this._connection.onDisconnect((manually: boolean, reason?: Error) => {
			this._registered = false;
			if (this._pingCheckTimer) {
				clearTimeout(this._pingCheckTimer);
			}
			if (this._pingTimeoutTimer) {
				clearTimeout(this._pingTimeoutTimer);
			}
			if (manually) {
				this._logger.info('Disconnected');
			} else {
				if (reason) {
					this._logger.error(`Disconnected unexpectedly: ${reason.message}`);
				} else {
					this._logger.error('Disconnected unexpectedly');
				}
			}
			this.emit(this.onDisconnect, manually, reason);
		});

		// eslint-disable-next-line no-restricted-syntax
		if (this._options.connection.reconnect !== false) {
			this._connection.onEnd(manually => {
				if (!manually) {
					this._logger.info('No further retries will be made');
				}
			});
		}
	}

	private _handleReceivedClientNick(me: string) {
		if (this._currentNick !== me) {
			if (this._currentNick !== '') {
				this._logger.warn(`Mismatching nicks: passed ${this._currentNick}, but you're actually ${me}`);
			}
			this._currentNick = me;
		}
	}

	// event helper
	private _handleEvents(message: Message): void {
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
		if (this._connection.isConnected) {
			this._pingCheckTimer = setTimeout(() => this.pingCheck(), this._pingOnInactivity * 1000);
		} else {
			this._pingCheckTimer = undefined;
		}
	}
}
