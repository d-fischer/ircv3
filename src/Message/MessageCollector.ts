import type { EventBinder, Listener } from '@d-fischer/typed-event-emitter';
import type { IrcClient } from '../IrcClient';
import type { Message, MessageConstructor } from './Message';

export type MessageCollectorEndCallback = (messages: Message[]) => void;

export class MessageCollector {
	protected _types: Set<MessageConstructor>;
	protected _messages: Message[] = [];
	protected _promise?: Promise<Message[]>;
	protected _promiseResolve?: MessageCollectorEndCallback;
	protected readonly _endEventHandlers = new Map<EventBinder<never>, Listener>();

	constructor(protected _client: IrcClient, protected _originalMessage: Message, ...types: MessageConstructor[]) {
		this._types = new Set(types);
	}

	untilEvent(eventType: EventBinder<never>): void {
		this._cleanEndEventHandler(eventType);
		const listener = this._client.on(eventType, () => this.end());
		this._endEventHandlers.set(eventType, listener);
	}

	async promise(): Promise<Message[]> {
		if (!this._promise) {
			this._promise = new Promise(resolve => (this._promiseResolve = resolve));
		}

		return await this._promise;
	}

	collect(message: Message): boolean {
		if (!this._originalMessage._acceptsInReplyCollection(message)) {
			return false;
		}

		this._messages.push(message);

		if (message.endsResponseTo(this._originalMessage)) {
			this.end();
		}

		return true;
	}

	end(): void {
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

	private _cleanEndEventHandler(eventType: EventBinder<never>) {
		if (this._endEventHandlers.has(eventType)) {
			this._client.removeListener(this._endEventHandlers.get(eventType)!);
			this._endEventHandlers.delete(eventType);
		}
	}
}
