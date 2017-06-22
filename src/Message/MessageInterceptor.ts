import Message, {MessageConstructor} from './Message';
import Client from '../Client';
import {Numeric421UnknownCommand} from './MessageTypes/Numerics';

export type MessageInterceptorEndConditionChecker = (message: Message, interceptor: MessageInterceptor) => boolean;
export type MessageInterceptorEndCallback = (messages: Message[]) => void;

export default class MessageInterceptor {
	protected _types: Set<MessageConstructor>;
	protected _messages: Message[] = [];
	protected _promise?: Promise<Message[]>;
	protected _promiseResolve?: MessageInterceptorEndCallback;
	protected _endCondition: MessageInterceptorEndConditionChecker = () => true;

	constructor(protected _client: Client, protected _originalMessage: Message, ...types: MessageConstructor[]) {
		this._types = new Set(types);
	}

	public untilType(...types: MessageConstructor[]) {
		types.forEach(type => this._types.add(type));
		return this.until((message: Message) => {
			return types.some(type => message instanceof type);
		});
	}

	public until(condition: MessageInterceptorEndConditionChecker): this {
		this._endCondition = condition;
		return this;
	}

	public promise(): Promise<Message[]> {
		if (!this._promise) {
			this._promise = new Promise(resolve => this._promiseResolve = resolve);
		}

		return this._promise;
	}

	public intercept(message: Message): boolean {
		let unknown = false;

		// special case: if we get a 421 reply to this, always abort, even if the consumer did not request that
		// the command does not exist on the server, and trying to wait for the actual replies would break shit
		// (and probably lead to huge amounts of memory leaks)
		if (message instanceof Numeric421UnknownCommand && this._originalMessage.command === message.params.command) {
			unknown = true;
		} else if (!this._types.has(message.constructor as MessageConstructor)) {
			return false;
		}

		this._messages.push(message);

		// we'd use unknown first for short circuit, but the end condition might have some strange handler code
		// that's supposed to fire on every message received as reply
		if (this._endCondition(message, this) || unknown) {
			this.end();
		}

		return true;
	}

	public end() {
		this._client.stopIntercept(this);
		if (this._promiseResolve) {
			this._promiseResolve(this._messages);
		}
	}
}
