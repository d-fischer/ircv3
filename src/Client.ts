import Connection, {ConnectionInfo} from './Connection/Connection';
import WebSocketConnection from './Connection/WebSocketConnection';
import DirectConnection from './Connection/DirectConnection';
import {padLeft, sanitizeParameter as sanitize} from './Toolkit/StringTools';
import Message, {MessageConstructor} from './Message/Message';
import Ping from './Message/MessageTypes/Commands/Ping';
import Pong from './Message/MessageTypes/Commands/Pong';
import {Numeric004ServerInfo, Numeric005ISupport} from './Message/MessageTypes/Numerics';
import ObjectTools from './Toolkit/ObjectTools';
import MessageInterceptor from './Message/MessageInterceptor';

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

export default class Client {
	protected _connection: Connection;
	protected _nick: string;
	protected _userName: string;
	protected _realName: string;

	protected _events: Map<MessageConstructor, EventHandlerList> = new Map();

	// sane default based on RFC 1459
	protected _channelTypes: string = '#&';

	protected _supportedUserModes: string = 'iwso';
	protected _supportedChannelModes: SupportedChannelModes = {
		list: 'b',
		alwaysWithParam: 'ovk',
		paramWhenSet: 'l',
		noParam: 'imnpst'
	};
	protected _supportedFeatures: { [feature: string]: true | string } = {};
	protected _interceptors: MessageInterceptor[] = [];

	public constructor({connection, webSocket, channelTypes}: {
		connection: ConnectionInfo,
		webSocket?: boolean,
		channelTypes?: string
	}) {
		if (webSocket) {
			this._connection = new WebSocketConnection(connection);
		} else {
			this._connection = new DirectConnection(connection);
		}

		this._connection.on('connected', () => {
			if (connection.password) {
				this._connection.sendLine(`PASS ${sanitize(connection.password)}`);
			}
			this._connection.sendLine(`NICK ${sanitize(this._nick)}`);
			this._connection.sendLine(`USER ${sanitize(this._userName)} 8 * :${sanitize(this._realName, true)}`);
		});
		this._connection.on('lineReceived', (line: string) => {
			// tslint:disable:no-console
			console.log(`> recv: ${line}`);
			let parsedMessage = Message.parse(line, this);
			console.log('> recv parsed:', parsedMessage);
			this.handleEvents(parsedMessage);
			// tslint:enable:no-console
		});

		this.on(Ping, ({params: {message}}: Ping) => {
			//noinspection JSIgnoredPromiseFromCall
			this.createMessage(Pong, {message}).send();
		});

		this.on(Numeric004ServerInfo, ({params: {userModes}}: Numeric004ServerInfo) => {
			if (userModes) {
				this._supportedUserModes = userModes;
			}
		});

		this.on(Numeric005ISupport, ({params: {supports}}: Numeric005ISupport) => {
			this._supportedFeatures = Object.assign(
				this._supportedFeatures,
				ObjectTools.fromArray(supports.split(' '), (part: string) => {
					const [support, param] = part.split('=', 2);
					return {[support]: param || true};
				})
			);
		});

		this._nick = connection.nick;
		this._userName = connection.userName || connection.nick;
		this._realName = connection.realName || connection.nick;

		if (channelTypes) {
			this._channelTypes = channelTypes;
		}
	}

	public connect(): void {
		this._connection.connect();
	}

	public send(message: Message) {
		this._connection.sendLine(message.toString());
	}

	public on<T extends Message>(type: MessageConstructor<T>, handler: EventHandler<T>, handlerName?: string): string {
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
		type: MessageConstructor<T>,
		params: {[name in keyof D]?: string}
	) {
		return type.create<T, D>(this, params);
	}

	public get channelTypes() {
		return this._channelTypes;
	}

	get supportedChannelModes(): SupportedChannelModes {
		return this._supportedChannelModes;
	}

	public intercept(...types: MessageConstructor[]) {
		const interceptor = new MessageInterceptor(this, ...types);
		this._interceptors.push(interceptor);
		return interceptor;
	}

	public stopIntercept(interceptor: MessageInterceptor) {
		this._interceptors.splice(this._interceptors.findIndex(value => value === interceptor), 1);
	}

	private handleEvents(message: Message): void {
		if (this._interceptors.some(interceptor => interceptor.intercept(message))) {
			return;
		}

		const handlers: EventHandlerList | undefined = this._events.get(message.constructor as MessageConstructor);
		if (!handlers) {
			return;
		}

		for (const handler of Object.values(handlers)) {
			handler(message);
		}
	}
}
