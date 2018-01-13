import Message, { MessageConstructor } from './Message';
import Client from '../Client';
import { Listener } from '../TypedEventEmitter';

export type MessageCollectorEndCallback = (messages: Message[]) => void;

export default class MessageCollector {
	protected _types: Set<MessageConstructor>;
	protected _messages: Message[] = [];
	protected _promise?: Promise<Message[]>;
	protected _promiseResolve?: MessageCollectorEndCallback;
	protected _endEventHandlers: Map<Function, Listener> = new Map();

	constructor(protected _client: Client, protected _originalMessage: Message, ...types: MessageConstructor[]) {
		this._types = new Set(types);
	}

	public untilEvent(eventType: Function) {
		this._cleanEndEventHandler(eventType);
		const listener = this._client.on(eventType, () => this.end());
		this._endEventHandlers.set(eventType, listener);
	}

	public promise(): Promise<Message[]> {
		if (!this._promise) {
			this._promise = new Promise(resolve => this._promiseResolve = resolve);
		}

		return this._promise;
	}

	public collect(message: Message): boolean {
		if (!this._originalMessage._acceptsInReplyCollection(message)) {
			return false;
		}

		this._messages.push(message);

		if (message.endsResponseTo(this._originalMessage)) {
			this.end();
		}

		return true;
	}

	public end() {
		this._client.stopCollect(this);
		this._cleanEndEventHandlers();
		if (this._promiseResolve) {
			this._promiseResolve(this._messages);
		}
	}

	private _cleanEndEventHandlers() {
		this._endEventHandlers.forEach(listener => this._client.removeListener(listener));
		this._endEventHandlers.clear();
	}

	private _cleanEndEventHandler(eventType: Function) {
		if (this._endEventHandlers.has(eventType)) {
			this._client.removeListener(this._endEventHandlers.get(eventType)!);
			this._endEventHandlers.delete(eventType);
		}
	}
}
