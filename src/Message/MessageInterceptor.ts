import Message, {MessageConstructor} from './Message';
import Client from '../Client';
import {Numeric421UnknownCommand} from './MessageTypes/Numerics';

export type MessageInterceptorConditionChecker = (message: Message, interceptor: MessageInterceptor) => boolean;
export type MessageInterceptorEndCallback = (messages: Message[]) => void;

export default class MessageInterceptor {
	protected _types: Set<MessageConstructor>;
	protected _messages: Message[] = [];
	protected _promise?: Promise<Message[]>;
	protected _promiseResolve?: MessageInterceptorEndCallback;
	protected _additionalCondition: MessageInterceptorConditionChecker = () => false;
	protected _endCondition: MessageInterceptorConditionChecker = () => true;

	constructor(protected _client: Client, protected _originalMessage: Message, ...types: MessageConstructor[]) {
		this._types = new Set(types);
	}

	public addType(...types: MessageConstructor[]) {
		types.forEach(type => this._types.add(type));
	}

	public untilType(...types: MessageConstructor[]) {
		this.addType(...types);
		return this.until((message: Message) => {
			return types.some(type => message instanceof type);
		});
	}

	public until(condition: MessageInterceptorConditionChecker): this {
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
		let isInterceptedType = false;

		// special case: if we get a 421 reply to this, always abort, even if the consumer did not request that -
		// the command does not exist on the server, and trying to wait for the actual replies would break shit
		// (and probably lead to huge amounts of memory leaks)
		if (message instanceof Numeric421UnknownCommand && this._originalMessage.command === message.params.command) {
			unknown = true;
		} else {
			isInterceptedType = this._types.has(message.constructor as MessageConstructor);
			if (!this._additionalCondition(message, this) && !isInterceptedType) {
				return false;
			}
		}

		this._messages.push(message);

		// we'd use unknown first for short circuit, but the end condition might have some strange handler code
		// that's supposed to fire on every message received as reply
		if (this._endCondition(message, this) || unknown) {
			this.end();
		}

		return isInterceptedType || unknown;
	}

	public end() {
		this._client.stopIntercept(this);
		if (this._promiseResolve) {
			this._promiseResolve(this._messages);
		}
	}
}
