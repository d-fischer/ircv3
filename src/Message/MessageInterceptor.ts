import Message, {MessageConstructor} from './Message';
import Client from '../Client';

export type MessageInterceptorEndConditionChecker = (message: Message, interceptor: MessageInterceptor) => boolean;
export type MessageInterceptorEndCallback = (messages: Message[]) => void;

export default class MessageInterceptor {
	protected _types: Set<MessageConstructor>;
	protected _messages: Message[] = [];
	protected _promise?: Promise<Message[]>;
	protected _promiseResolve?: MessageInterceptorEndCallback;
	protected _endCondition: MessageInterceptorEndConditionChecker = () => true;

	constructor(protected _client: Client, ...types: MessageConstructor[]) {
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
		if (!this._types.has(message.constructor as MessageConstructor)) {
			return false;
		}

		this._messages.push(message);

		if (this._endCondition(message, this)) {
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
