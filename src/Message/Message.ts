import ObjectTools from '../Toolkit/ObjectTools';
import { isChannel } from '../Toolkit/StringTools';
import { MessageDataType } from '../Toolkit/TypeTools';
import { ServerProperties, defaultServerProperties } from '../ServerProperties';

export type MessagePrefix = {
	raw: string;
	nick: string;
	user?: string;
	host?: string;
};

export interface MessageParam {
	value: string;
	trailing: boolean;
}

export interface MessageParamSpecEntry {
	trailing?: boolean;
	rest?: boolean;
	optional?: boolean;
	type?: 'channel';
	match?: RegExp;
}

export type MessageParamSpec<T extends Message = Message> = {
	[name in keyof MessageDataType<T>]: MessageParamSpecEntry
};

export interface MessageConstructor<T extends Message = Message> {
	COMMAND: string;
	PARAM_SPEC: MessageParamSpec<T>;
	SUPPORTS_CAPTURE: boolean;
	minParamCount: number;

	new(command: string, params?: MessageParam[], tags?: Map<string, string>, prefix?: MessagePrefix, serverProperties?: ServerProperties, rawLine?: string): T;

	create(this: MessageConstructor<T>, params: { [name in keyof MessageDataType<T>]?: string }, prefix?: MessagePrefix, serverProperties?: ServerProperties): T;

	checkParam(param: string, spec: MessageParamSpecEntry, serverProperties?: ServerProperties): boolean;
}

export default class Message<D extends { [name in keyof D]?: MessageParam } = {}> {
	static readonly COMMAND: string = '';
	static readonly PARAM_SPEC = {};
	//noinspection JSUnusedGlobalSymbols
	static readonly SUPPORTS_CAPTURE: boolean = false;

	protected _tags?: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: MessageParam[] = [];
	protected _parsedParams!: D;
	protected _serverProperties: ServerProperties = defaultServerProperties;

	private readonly _raw?: string;

	static create<T extends Message>(
		this: MessageConstructor<T>,
		params: { [name in keyof MessageDataType<T>]?: string },
		prefix?: MessagePrefix,
		serverProperties: ServerProperties = defaultServerProperties
	): T {
		const message: T = new this(this.COMMAND, undefined, undefined, undefined, serverProperties);
		const parsedParams: { [name in keyof MessageDataType<T>]?: MessageParam } = {};
		ObjectTools.forEach(this.PARAM_SPEC, (paramSpec: MessageParamSpecEntry, paramName: keyof MessageDataType<T>) => {
			if (paramName in params) {
				const param = params[paramName];
				if (this.checkParam(param!, paramSpec, serverProperties)) {
					parsedParams[paramName] = {
						value: param!,
						trailing: Boolean(paramSpec.trailing)
					};
				} else if (!paramSpec.optional) {
					throw new Error(`required parameter "${paramName}" did not suit requirements: "${param}"`);
				}
			}
			if (!(paramName in parsedParams) && !paramSpec.optional) {
				throw new Error(`required parameter "${paramName}" not found in command "${this.COMMAND}"`);
			}
		});

		message._parsedParams = parsedParams;

		return message;
	}

	static checkParam(param: string, spec: MessageParamSpecEntry, serverProperties: ServerProperties = defaultServerProperties): boolean {
		if (spec.type === 'channel') {
			if (!isChannel(param, serverProperties.channelTypes)) {
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

	toString(): string {
		const cls = this.constructor as MessageConstructor<this>;
		const specKeys = ObjectTools.keys(cls.PARAM_SPEC);
		return [this._command, ...specKeys.map((paramName): string | undefined => {
			const param = this._parsedParams[paramName];
			if (param) {
				return (param.trailing ? ':' : '') + param.value;
			}
		}).filter((param: string | undefined) => param !== undefined)].join(' ');
	}

	constructor(command: string, params?: MessageParam[], tags?: Map<string, string>, prefix?: MessagePrefix, serverProperties: ServerProperties = defaultServerProperties, rawLine?: string) {
		this._command = command;
		this._params = params;
		this._tags = tags;
		this._prefix = prefix;
		this._serverProperties = serverProperties;
		this._raw = rawLine;

		this.parseParams();
	}

	parseParams() {
		if (this._params) {
			const cls = this.constructor as MessageConstructor<this>;
			let requiredParamsLeft = cls.minParamCount;
			if (requiredParamsLeft > this._params.length) {
				throw new Error(
					`command "${this._command}" expected ${requiredParamsLeft} or more parameters, got ${this._params.length}`
				);
			}

			const paramSpecList = cls.PARAM_SPEC;
			let i = 0;
			const parsedParams: { [name in keyof D]?: MessageParam } = {};
			for (const [paramName, paramSpec] of Object.entries<MessageParamSpecEntry>(paramSpecList)) {
				if ((this._params.length - i) <= requiredParamsLeft) {
					if (paramSpec.optional) {
						continue;
					} else if (this._params.length - i !== requiredParamsLeft) {
						throw new Error(
							'not enough parameters left for required parameters parsing (this is a library bug)'
						);
					}
				}
				let param: MessageParam = this._params[i];
				if (!param) {
					if (paramSpec.optional) {
						break;
					}

					throw new Error('unexpected parameter underflow');
				}

				if (paramSpec.rest) {
					const restParams = [];
					while (this._params[i] && !this._params[i].trailing) {
						restParams.push(this._params[i].value);
						++i;
					}
					if (!restParams.length) {
						if (paramSpec.optional) {
							continue;
						}
						throw new Error(`no parameters left for required rest parameter "${paramName}"`);
					}
					param = {
						value: restParams.join(' '),
						trailing: false
					};
				}
				if (Message.checkParam(param.value, paramSpec)) {
					parsedParams[paramName as keyof MessageParamSpec<this>] = { ...param };
					if (!paramSpec.optional) {
						--requiredParamsLeft;
					}
					if (!paramSpec.rest) {
						++i;
					}
				} else if (!paramSpec.optional) {
					throw new Error(`required parameter "${paramName}" (index ${i}) did not suit requirements: "${param.value}"`);
				}

				if (paramSpec.trailing) {
					break;
				}
			}

			this._parsedParams = parsedParams as D;
		}
	}

	static get minParamCount(): number {
		return Object.values(this.PARAM_SPEC).filter((spec: MessageParamSpecEntry) => !spec.optional).length;
	}

	get params(): { [name in Extract<keyof D, string>]: string } {
		return ObjectTools.map(this._parsedParams, (param: MessageParam) => param.value);
	}

	get prefix(): MessagePrefix | undefined {
		return this._prefix && { ...this._prefix };
	}

	get command(): string {
		return this._command;
	}

	get tags(): Map<string, string> {
		return new Map(this._tags || []);
	}

	get rawLine() {
		return this._raw;
	}

	protected isResponseTo(originalMessage: Message): boolean {
		return false;
	}

	endsResponseTo(originalMessage: Message): boolean {
		return false;
	}

	_acceptsInReplyCollection(message: Message): boolean {
		// TODO implement IRCv3 labeled-response / batch here
		return message.isResponseTo(this);
	}
}
