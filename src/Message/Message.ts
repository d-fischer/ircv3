type NickOnlyMessagePrefix = {
	raw: string;
	nick: string;
};

export type MessagePrefix = NickOnlyMessagePrefix | NickOnlyMessagePrefix & {
	user?: string;
	host: string;
};

export type MessageParamSpecEntry = true | {
	trailing?: boolean
	optional?: boolean;
};
export type MessageParamSpec<T> = { [name in keyof T]?: MessageParamSpecEntry };

export interface MessageConstructor<T = Message> {
	COMMAND: string;
	new (command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix): T;
}

export default class Message {
	public static readonly COMMAND: string = '';

	private static _registeredTypes: Map<string, MessageConstructor<Message>> = new Map;

	public readonly PARAM_SPEC = {};

	protected _tags?: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: string[] = [];

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

	public static create<T extends Message>(this: MessageConstructor<T>, params: {[name in keyof T]?: T[name]}): T {
		let message = new this(this.COMMAND);
		for (let [paramName, paramSpec] of Object.entries<MessageParamSpecEntry | undefined>(message.PARAM_SPEC)) {
			if (paramSpec === undefined) {
				continue;
			}

			if (paramName in params) {
				message[paramName] = params[paramName];
			} else if (paramSpec === true || !paramSpec.optional) {
				throw new Error(`required parameter "${paramName}" not found in command "${this.COMMAND}"`);
			}
		}

		return message;
	}

	public constructor(command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix) {
		this._command = command;
		this._params = params;
		this._tags = tags;
		this._prefix = prefix;
	}

	public parseParams() {
		if (this._params) {
			if (this.minParamCount > this._params.length) {
				throw new Error(
					`command "${this._command}" expected ${this.minParamCount} or more parameters, got ${this._params.length}`
				);
			}

			const paramSpecList = this.PARAM_SPEC;
			let i = 0;
			for (let [paramName, paramSpec] of Object.entries<MessageParamSpecEntry | undefined>(paramSpecList)) {
				if (paramSpec === undefined) {
					continue;
				}

				if (paramSpec === true) {
					paramSpec = {trailing: false};
				}

				const param = this._params[i];

				if (param === undefined) {
					if (paramSpec.optional) {
						break;
					}
					throw new Error(`unexpected parameter underflow`);
				}

				this[paramName] = param;
				++i;

				if (paramSpec.trailing) {
					break;
				}
			}
		}
	}

	public toString(): string {
		const specEntries = Object.entries<MessageParamSpecEntry | undefined>(this.PARAM_SPEC);
		return [this._command, ...specEntries.map(([paramName, paramSpec]: [string, MessageParamSpecEntry]) => {
			return ((paramSpec !== true && paramSpec.trailing) ? ':' : '') + this[paramName];
		})].join(' ');
	}

	public get minParamCount(): number {
		let i = 0;
		Object.entries<MessageParamSpecEntry | undefined>(this.PARAM_SPEC).some((spec: MessageParamSpecEntry) => {
			if (spec !== true && spec.optional) {
				return true;
			} else {
				++i;
				return false;
			}
		});

		return i;
	}
}
