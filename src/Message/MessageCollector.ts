import Message, { MessageConstructor } from './Message';
import Client from '../Client';

export type MessageCollectorEndCallback = (messages: Message[]) => void;

export default class MessageCollector {
	protected _types: Set<MessageConstructor>;
	protected _messages: Message[] = [];
	protected _promise?: Promise<Message[]>;
	protected _promiseResolve?: MessageCollectorEndCallback;
	protected _endEventHandlers: Map<string, Function> = new Map();

	constructor(protected _client: Client, protected _originalMessage: Message, ...types: MessageConstructor[]) {
		this._types = new Set(types);
	}

	public untilEvent(eventType: string) {
		this._cleanEndEventHandler(eventType);
		this._endEventHandlers.set(eventType, () => this.end());
	}

	public promise(): Promise<Message[]> {
		if (!this._promise) {
			this._promise = new Promise(resolve => this._promiseResolve = resolve);
		}

		return this._promise;
	}

	public collect(message: Message): boolean {
		if (!this._originalMessage.acceptsInCollection(message)) {
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
		this._endEventHandlers.forEach((handler, type) => this._client.removeListener(type, handler as () => void));
		this._endEventHandlers.clear();
	}

	private _cleanEndEventHandler(eventType: string) {
		if (this._endEventHandlers.has(eventType)) {
			this._client.removeListener(eventType, this._endEventHandlers.get(eventType) as () => void);
			this._endEventHandlers.delete(eventType);
		}
	}
}
