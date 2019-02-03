import ObjectTools from '../Toolkit/ObjectTools';
import { isChannel } from '../Toolkit/StringTools';
import { MessageDataType } from '../Toolkit/TypeTools';
import { ServerProperties, defaultServerProperties } from '../ServerProperties';
import NotEnoughParametersError from '../Errors/NotEnoughParametersError';
import ParameterRequirementMismatchError from '../Errors/ParameterRequirementMismatchError';

export type MessagePrefix = {
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
	noClient?: boolean;
	noServer?: boolean;
	type?: 'channel' | 'channelList';
	match?: RegExp;
}

export type MessageParamSpec<T extends Message = Message> = {
	[name in keyof MessageDataType<T>]: MessageParamSpecEntry
};

export interface MessageConstructor<T extends Message = Message> {
	COMMAND: string;
	PARAM_SPEC: MessageParamSpec<T>;
	SUPPORTS_CAPTURE: boolean;
	getMinParamCount(isServer?: boolean): number;

	new(command: string, params?: MessageParam[], tags?: Map<string, string>, prefix?: MessagePrefix, serverProperties?: ServerProperties, rawLine?: string, isServer?: boolean): T;

	create(this: MessageConstructor<T>, params: { [name in keyof MessageDataType<T>]?: string }, prefix?: MessagePrefix, tags?: Map<string, string>, serverProperties?: ServerProperties): T;

	checkParam(param: string, spec: MessageParamSpecEntry, serverProperties?: ServerProperties): boolean;
}

const tagEscapeMap: { [char: string]: string } = {
	'\\': '\\',
	';': ':',
	'\n': 'n',
	'\r': 'r',
	' ': 's'
};

function escapeTag(str: string) {
	return str.replace(/[\\;\n\r ]/g, match => `\\${tagEscapeMap[match]}`);
}

export function prefixToString(prefix: MessagePrefix) {
	let result = `${prefix.nick}`;
	if (prefix.user) {
		result += `!${prefix.user}`;
	}
	if (prefix.host) {
		result += `@${prefix.host}`;
	}

	return result;
}

export default class Message<D extends { [name in keyof D]?: MessageParam } = {}> {
	static readonly COMMAND: string = '';
	static readonly PARAM_SPEC = {};
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
		tags?: Map<string, string>,
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

		message._prefix = prefix;
		message._tags = tags;

		return message;
	}

	static checkParam(param: string, spec: MessageParamSpecEntry, serverProperties: ServerProperties = defaultServerProperties): boolean {
		if (spec.type === 'channel') {
			if (!isChannel(param, serverProperties.channelTypes)) {
				return false;
			}
		}

		if (spec.type === 'channelList') {
			const channels = param.split(',');
			if (!channels.every(chan => isChannel(chan, serverProperties.channelTypes))) {
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

	prefixToString() {
		if (!this._prefix) {
			return '';
		}

		return prefixToString(this._prefix);
	}

	tagsToString() {
		if (!this._tags) {
			return '';
		}

		return [...this._tags.entries()].map(([key, value]) => `${escapeTag(key)}=${escapeTag(value)}`).join(';');
	}

	toString(complete: boolean = false): string {
		const cls = this.constructor as MessageConstructor<this>;
		const specKeys = ObjectTools.keys(cls.PARAM_SPEC);
		const fullCommand = [this._command, ...specKeys.map((paramName): string | undefined => {
			const param = this._parsedParams[paramName];
			if (param) {
				return (param.trailing ? ':' : '') + param.value;
			}
		}).filter((param: string | undefined) => param !== undefined)].join(' ');

		if (!complete) {
			return fullCommand;
		}

		const parts = [fullCommand];

		const prefix = this.prefixToString();
		if (prefix) {
			parts.unshift(`:${prefix}`);
		}

		const tags = this.tagsToString();
		if (tags) {
			parts.unshift(`@${tags}`);
		}

		return parts.join(' ');
	}

	constructor(
		command: string,
		params?: MessageParam[],
		tags?: Map<string, string>,
		prefix?: MessagePrefix,
		serverProperties: ServerProperties = defaultServerProperties,
		rawLine?: string,
		isServer: boolean = false
	) {
		this._command = command;
		this._params = params;
		this._tags = tags;
		this._prefix = prefix;
		this._serverProperties = serverProperties;
		this._raw = rawLine;

		this.parseParams(isServer);
	}

	parseParams(isServer: boolean = false) {
		if (this._params) {
			const cls = this.constructor as MessageConstructor<this>;
			let requiredParamsLeft = cls.getMinParamCount(isServer);
			if (requiredParamsLeft > this._params.length) {
				throw new NotEnoughParametersError(this._command, requiredParamsLeft, this._params.length);
			}

			const paramSpecList = cls.PARAM_SPEC;
			let i = 0;
			const parsedParams: { [name in keyof D]?: MessageParam } = {};
			for (const [paramName, paramSpec] of Object.entries<MessageParamSpecEntry>(paramSpecList)) {
				if (paramSpec.noServer && isServer) {
					continue;
				}
				if (paramSpec.noClient && !isServer) {
					continue;
				}
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
					throw new ParameterRequirementMismatchError(this._command, paramName, paramSpec, param.value);
				}

				if (paramSpec.trailing) {
					break;
				}
			}

			this._parsedParams = parsedParams as D;
		}
	}

	static getMinParamCount(isServer: boolean = false): number {
		return Object.values(this.PARAM_SPEC).filter((spec: MessageParamSpecEntry) => {
			if (spec.noServer && isServer) {
				return false;
			}
			if (spec.noClient && !isServer) {
				return false;
			}
			return !spec.optional;
		}).length;
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
