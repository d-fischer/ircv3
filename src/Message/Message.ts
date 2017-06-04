import ObjectTools from '../Toolkit/ObjectTools';
type NickOnlyMessagePrefix = {
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
	trailing: boolean;
	optional: boolean;
}

export type MessageParamSpec<D> = {
	[name in keyof D]: MessageParamSpecEntry
};

export interface MessageConstructor<T extends Message = Message, D = {}> {
	COMMAND: string;
	PARAM_SPEC: MessageParamSpec<D>;
	minParamCount: number;
	new (command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix): T;
}

export default class Message<D = {}> {
	public static readonly COMMAND: string = '';
	public static readonly PARAM_SPEC = {};

	private static _registeredTypes: Map<string, MessageConstructor<Message>> = new Map;

	protected _tags?: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: string[] = [];
	protected _parsedParams: D;

	private _raw: string;

	public static registerType(cls: MessageConstructor) {
		if (cls.COMMAND !== '') {
			Message._registeredTypes.set(cls.COMMAND, cls);
		}
	}

	public static parse(line: string): Message {
		const splitLine: string[] = line.split(' ');
		let token: string;

		let command: string | undefined;
		let params: string[] = [];
		let tags: Map<string, string> | undefined;
		let prefix: MessagePrefix | undefined;

		while ((token = splitLine[0]) !== undefined) {
			if (token[0] === '@' && !tags) {
				tags = Message.parseTags(token.substr(1));
			} else if (token[0] === ':') {
				if (!prefix && !command) {
					prefix = Message.parsePrefix(token.substr(1));
				} else {
					params.push(splitLine.join(' ').substr(1));
					break;
				}
			} else if (!command) {
				command = token.toUpperCase();
			} else {
				params.push(token);
			}
			splitLine.shift();
		}

		if (!command) {
			throw new Error(`line without command received: ${line}`);
		}

		let message: Message | undefined = undefined;

		if (Message._registeredTypes.has(command)) {
			const messageClass = Message._registeredTypes.get(command);
			if (messageClass) {
				message = new messageClass(command, params, tags, prefix);
			}
		}

		if (!message) {
			message = new Message(command, params, tags, prefix);
		}

		message._raw = line;
		message.parseParams();

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

	public static create<T extends Message, D>(
		this: MessageConstructor<T>,
		params: {[name in keyof D]?: string}
	): T {
		let message = new this(this.COMMAND);
		let parsedParams = {};
		for (let [paramName, paramSpec] of Object.entries<MessageParamSpecEntry>(this.PARAM_SPEC)) {
			if (paramName in params) {
				const param = params[paramName];
				if (param !== undefined) {
					parsedParams[paramName] = new MessageParam(param, paramSpec.trailing);
				}
			}
			if (!(paramName in parsedParams) && !paramSpec.optional) {
				throw new Error(`required parameter "${paramName}" not found in command "${this.COMMAND}"`);
			}
		}
		message._parsedParams = parsedParams;

		return message;
	}

	public toString(): string {
		const cls = this.constructor as MessageConstructor<this>;
		const specKeys = Object.keys(cls.PARAM_SPEC);
		return [this._command, ...specKeys.map((paramName: keyof D): string | void => {
			const param = this._parsedParams[paramName];
			if (param instanceof MessageParam) {
				return (param.trailing ? ':' : '') + param.value;
			}
		}).filter((param: string|undefined) => param !== undefined)].join(' ');
	}

	public constructor(command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix) {
		this._command = command;
		this._params = params;
		this._tags = tags;
		this._prefix = prefix;

		this.parseParams();
	}

	public parseParams() {
		if (this._params) {
			const cls = this.constructor as MessageConstructor<this>;
			if (cls.minParamCount > this._params.length) {
				throw new Error(
					`command "${this._command}" expected ${cls.minParamCount} or more parameters, got ${this._params.length}`
				);
			}

			const paramSpecList = cls.PARAM_SPEC;
			let i = 0;
			let hadTrailing: boolean = false;
			let parsedParams = {};
			for (let [paramName, paramSpec] of Object.entries<MessageParamSpecEntry>(paramSpecList)) {
				hadTrailing = hadTrailing || paramSpec.trailing;
				const param = this._params[i];

				if (!param) {
					if (paramSpec.optional && hadTrailing) {
						break;
					}
					throw new Error(`unexpected parameter underflow`);
				}

				parsedParams[paramName] = new MessageParam(param, Boolean(paramSpec.trailing));
				++i;

				if (paramSpec.trailing) {
					break;
				}
			}

			this._parsedParams = parsedParams as D;
		}
	}

	public static get minParamCount(): number {
		let i = 0;
		Object.values(this.PARAM_SPEC).reduce(
			(result: number, spec: MessageParamSpecEntry) => {
				if (!spec.optional) {
					++result;
				}

				return result;
			},
			0
		);

		return i;
	}

	public get params(): {[name in keyof D]: string} {
		return ObjectTools.map(this._parsedParams as D, (param: MessageParam) => param.value);
	}
}
