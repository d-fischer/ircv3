import Client from '../Client';

import ObjectTools from '../Toolkit/ObjectTools';
import {isChannel} from '../Toolkit/StringTools';

export type NickOnlyMessagePrefix = {
	raw: string;
	nick: string;
};

export type MessagePrefix = NickOnlyMessagePrefix | NickOnlyMessagePrefix & {
	user?: string;
	host: string;
};

export class MessageParam {
	constructor(public value: string, public trailing: boolean) {
	}
}

export interface MessageParamSpecEntry {
	trailing?: boolean;
	rest?: boolean;
	optional?: boolean;
	type?: 'channel';
	match?: RegExp;
}

export type MessageParamSpec<D> = {
	[name in keyof D]: MessageParamSpecEntry
};

// WS doesn't pick up members of this to be actually used, so we need to turn off their inspections
export interface MessageConstructor<T extends Message = Message, D = {}> {
	COMMAND: string;
	PARAM_SPEC: MessageParamSpec<D>;
	SUPPORTS_CAPTURE: boolean;
	minParamCount: number;
	new (client: Client, command: string, params?: MessageParam[], tags?: Map<string, string>, prefix?: MessagePrefix): T;
	create(this: MessageConstructor<T>, client: Client, params: {[name in keyof D]?: string}): T;
	checkParam(client: Client, param: string, spec: MessageParamSpecEntry): boolean;
}

export default class Message<D = {}> {
	public static readonly COMMAND: string = '';
	public static readonly PARAM_SPEC = {};
	//noinspection JSUnusedGlobalSymbols
	public static readonly SUPPORTS_CAPTURE: boolean = false;

		private static _registeredTypes: Map<string, MessageConstructor<Message>> = new Map;

	protected _tags?: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: MessageParam[] = [];
	protected _parsedParams: D;
	protected _client: Client;

	private _raw: string;

	public static registerType(cls: MessageConstructor) {
		if (cls.COMMAND !== '') {
			Message._registeredTypes.set(cls.COMMAND, cls);
		}
	}

	public static parse(line: string, client: Client): Message {
		const splitLine: string[] = line.split(' ');
		let token: string;

		let command: string | undefined;
		let params: MessageParam[] = [];
		let tags: Map<string, string> | undefined;
		let prefix: MessagePrefix | undefined;

		while ((token = splitLine[0]) !== undefined) {
			if (token[0] === '@' && !tags && !command) {
				tags = Message.parseTags(token.substr(1));
			} else if (token[0] === ':') {
				if (!prefix && !command) {
					prefix = Message.parsePrefix(token.substr(1));
				} else {
					params.push(new MessageParam(splitLine.join(' ').substr(1), true));
					break;
				}
			} else if (!command) {
				command = token.toUpperCase();
			} else {
				params.push(new MessageParam(token, false));
			}
			splitLine.shift();
		}

		if (!command) {
			throw new Error(`line without command received: ${line}`);
		}

		let message: Message | undefined;

		if (Message._registeredTypes.has(command)) {
			const messageClass = Message._registeredTypes.get(command) as MessageConstructor;
			message = new messageClass(client, command, params, tags, prefix);
		}

		if (!message) {
			message = new Message(client, command, params, tags, prefix);
		}

		message._raw = line;

		return message;
	}

	public static parsePrefix(raw: string): MessagePrefix {
		const [nick, hostName] = raw.split('!', 2);
		if (hostName) {
			let [user, host] = hostName.split('@', 2);
			if (host) {
				return {raw, nick, user, host};
			} else {
				return {raw, nick, host: user};
			}
		} else {
			return {raw, nick};
		}
	}

	public static parseTags(raw: string): Map<string, string> {
		let tags: Map<string, string> = new Map();
		const tagStrings = raw.split(';');
		for (const tagString of tagStrings) {
			const [tagName, tagValue] = tagString.split('=', 2);
			// unescape according to http://ircv3.net/specs/core/message-tags-3.2.html#escaping-values
			tags.set(tagName, tagValue.replace(/\\([\\:nrs])/g, (_, match) => {
				return {
					'\\': '\\',
					':': ';',
					n: '\n',
					r: '\r',
					s: ' '
				}[match];
			}));
		}

		return tags;
	}

	// noinspection JSUnusedGlobalSymbols
	public static create<T extends Message, D>(
		this: MessageConstructor<T>,
		client: Client,
		params: {[name in keyof D]?: string}
	): T {
		let message = new this(client, this.COMMAND);
		let parsedParams = {};
		for (let [paramName, paramSpec] of Object.entries<MessageParamSpecEntry>(this.PARAM_SPEC)) {
			if (paramName in params) {
				const param = params[paramName];
				if (param !== undefined) {
					if (this.checkParam(client, param, paramSpec)) {
						parsedParams[paramName] = new MessageParam(param, Boolean(paramSpec.trailing));
					} else if (!paramSpec.optional) {
						throw new Error(`required parameter ${paramName} did not suit requirements: "${param}"`);
					}
				}
			}
			if (!(paramName in parsedParams) && !paramSpec.optional) {
				throw new Error(`required parameter "${paramName}" not found in command "${this.COMMAND}"`);
			}
		}
		message._parsedParams = parsedParams;

		return message;
	}

	public static checkParam(client: Client, param: string, spec: MessageParamSpecEntry): boolean {
		if (spec.type === 'channel') {
			if (!isChannel(param, client.channelTypes)) {
				return false;
			}
		}

		if (spec.match) {
			if (!spec.match.test(param)) {
				return false;
			}
		}

		return true;
	}

	public toString(): string {
		const cls = this.constructor as MessageConstructor<this, D>;
		const specKeys = Object.keys(cls.PARAM_SPEC);
		return [this._command, ...specKeys.map((paramName: keyof D): string | void => {
			const param = this._parsedParams[paramName];
			if (param instanceof MessageParam) {
				return (param.trailing ? ':' : '') + param.value;
			}
		}).filter((param: string|undefined) => param !== undefined)].join(' ');
	}

	public constructor(
		client: Client, command: string, params?: MessageParam[], tags?: Map<string, string>, prefix?: MessagePrefix
	) {
		this._command = command;
		this._params = params;
		this._tags = tags;
		this._prefix = prefix;

		Object.defineProperty(this, '_client', {
			get: () => {
				return client;
			}
		});

		this.parseParams();
	}

	public parseParams() {
		if (this._params) {
			const cls = this.constructor as MessageConstructor<this, D>;
			let requiredParamsLeft = cls.minParamCount;
			if (requiredParamsLeft > this._params.length) {
				throw new Error(
					`command "${this._command}" expected ${requiredParamsLeft} or more parameters, got ${this._params.length}`
				);
			}

			const paramSpecList = cls.PARAM_SPEC;
			let i = 0;
			let parsedParams = {};
			for (let [paramName, paramSpec] of Object.entries<MessageParamSpecEntry>(paramSpecList as MessageParamSpec<{}>)) {
				if ((this._params.length - i) <= requiredParamsLeft) {
					if (paramSpec.optional) {
						continue;
					} else if (this._params.length - i !== requiredParamsLeft) {
						throw new Error('not enough parameters left for required parameters parsing (this is a bug)');
					}
				}
				let param = this._params[i];
				if (!param) {
					if (paramSpec.optional) {
						break;
					}

					throw new Error(`unexpected parameter underflow`);
				}

				if (paramSpec.rest) {
					let restParams = [];
					while (this._params[i] && !this._params[i].trailing) {
						restParams.push(this._params[i].value);
						++i;
					}
					if (!restParams.length) {
						if (paramSpec.optional) {
							continue;
						}
						throw new Error(`no parameters left for required rest parameter ${paramName}`);
					}
					param = new MessageParam(restParams.join(' '), false);
				}
				if (this.checkParam(param.value, paramSpec)) {
					parsedParams[paramName] = new MessageParam(param.value, param.trailing);
					if (!paramSpec.optional) {
						--requiredParamsLeft;
					}
					if (!paramSpec.rest) {
						++i;
					}
				} else if (!paramSpec.optional) {
					throw new Error(`required parameter ${paramName} (index ${i}) did not suit requirements: "${param.value}"`);
				}

				if (paramSpec.trailing) {
					break;
				}
			}

			this._parsedParams = parsedParams as D;
		}
	}

	public checkParam(param: string, spec: MessageParamSpecEntry): boolean {
		const cls = this.constructor as MessageConstructor<this, D>;
		return cls.checkParam(this._client, param, spec);
	}

	// noinspection JSUnusedGlobalSymbols
	public static get minParamCount(): number {
		return Object.values(this.PARAM_SPEC).filter((spec: MessageParamSpecEntry) => !spec.optional).length;
	}

	// WS doesn't pick this up in destructuring, so we need to turn off the inspection
	// noinspection JSUnusedGlobalSymbols
	public get params(): {[name in keyof D]: string} {
		return ObjectTools.map(this._parsedParams as D, (param: MessageParam) => param.value);
	}

	public get command(): string {
		return this._command;
	}

	public send(): void {
		this._client.send(this);
	}

	public async sendAndCaptureReply(): Promise<Message[]> {
		const cls = this.constructor as MessageConstructor<this, D>;

		if (!cls.SUPPORTS_CAPTURE) {
			throw new Error(`The command ${cls.COMMAND} does not support reply capture`);
		}

		const promise = this._client.collect(this).promise();
		this.send();
		return await promise;
	}

	protected isResponseTo(originalMessage: Message): boolean {
		return false;
	}

	public endsResponseTo(originalMessage: Message): boolean {
		return false;
	}

	public acceptsInCollection(message: Message): boolean {
		// TODO implement IRCv3 labeled-response / batch here
		return message.isResponseTo(this);
	}
}
