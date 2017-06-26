import Connection, {ConnectionInfo} from './Connection/Connection';
import WebSocketConnection from './Connection/WebSocketConnection';
import DirectConnection from './Connection/DirectConnection';
import {padLeft} from './Toolkit/StringTools';
import Message, {MessageConstructor} from './Message/Message';
import {Ping, Pong, Password, UserRegistration, NickChange} from './Message/MessageTypes/Commands';
import ObjectTools from './Toolkit/ObjectTools';
import MessageCollector from './Message/MessageCollector';

import {EventEmitter} from 'events';

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

	protected _events: Map<MessageConstructor, EventHandlerList> = new Map();

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

	public constructor({connection, webSocket, channelTypes}: {
		connection: ConnectionInfo,
		webSocket?: boolean,
		channelTypes?: string
	}) {
		super();
		if (webSocket) {
			this._connection = new WebSocketConnection(connection);
		} else {
			this._connection = new DirectConnection(connection);
		}

		this._connection.on('connected', () => {
			if (connection.password) {
				this.createMessage(Password, {password: connection.password}).send();
			}
			this.createMessage(NickChange, {nick: this._nick}).send();
			this.createMessage(UserRegistration, {
				user: this._userName,
				mode: '8',
				unused: '*',
				realName: this._realName
			}).send();
		});

		this._connection.on('lineReceived', (line: string) => {
			// tslint:disable:no-console
			console.log(`> recv: ${line}`);
			let parsedMessage = Message.parse(line, this);
			console.log('> recv parsed:', parsedMessage);
			this.handleEvents(parsedMessage);
			// tslint:enable:no-console
		});

		this.onMessage(Ping, ({params: {message}}: Ping) => {
			this.createMessage(Pong, {message}).send();
		});

		this.onMessage(Reply001Welcome, () => {
			this._registered = true;
			this.emit('registered');
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
				this.emit('registered');
			}
		});

		this._nick = connection.nick;
		this._userName = connection.userName || connection.nick;
		this._realName = connection.realName || connection.nick;

		if (channelTypes) {
			this._channelTypes = channelTypes;
		}
	}

	public connect(): void {
		this._registered = false;
		this._connection.connect();
	}

	public send(message: Message): void {
		this._connection.sendLine(message.toString());
	}

	public onMessage<T extends Message>(
		type: MessageConstructor<T>,
		handler: EventHandler<T>,
		handlerName?: string
	): string {
		if (!this._events.has(type)) {
			this._events.set(type, {});
		}

		let handlerList = this._events.get(type);

		if (!handlerList) {
			throw new Error(`Handler list for type "${type.name}" not found even though it was just created`);
		}

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
