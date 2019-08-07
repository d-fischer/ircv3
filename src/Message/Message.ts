import ObjectTools from '../Toolkit/ObjectTools';
import { isChannel } from '../Toolkit/StringTools';
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

// tslint:disable-next-line:no-any
export interface MessageConstructor<T extends Message<T> = any, X extends Exclude<keyof T, keyof Message> = never> extends Function {
	COMMAND: string;
	PARAM_SPEC?: MessageParamSpec<T, X>;
	SUPPORTS_CAPTURE: boolean;

	getMinParamCount(isServer?: boolean): number;

	new(
		command: string,
		params?: MessageParam[],
		tags?: Map<string, string>,
		prefix?: MessagePrefix,
		serverProperties?: ServerProperties,
		rawLine?: string,
		isServer?: boolean,
		shouldParseParams?: boolean
	): T;

	checkParam(param: string, spec: MessageParamSpecEntry, serverProperties?: ServerProperties): boolean;
}

export type MessageParamNames<T extends Message<T>, X extends Exclude<keyof T, keyof Message> = never> = Exclude<keyof T, (keyof Message) | X>;
export type MessageParams<T extends Message<T>, X extends Exclude<keyof T, keyof Message> = never> = Record<MessageParamNames<T>, MessageParam>;
export type MessageParamValues<T extends Message<T>, X extends Exclude<keyof T, keyof Message> = never> = Record<MessageParamNames<T>, string>;
export type MessageParamSpec<T extends Message<T>, X extends Exclude<keyof T, keyof Message> = never> = Record<MessageParamNames<T>, MessageParamSpecEntry>;

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

export function createMessage<T extends Message<T, X>, X extends Exclude<keyof T, keyof Message>>(
	type: MessageConstructor<T, X>,
	params: Partial<MessageParamValues<T, X>>,
	prefix?: MessagePrefix,
	tags?: Map<string, string>,
	serverProperties: ServerProperties = defaultServerProperties,
	isServer: boolean = false
): T {
	const message: T = new type(type.COMMAND, undefined, undefined, undefined, serverProperties);
	const parsedParams: Partial<MessageParams<T>> = {};
	ObjectTools.forEach(type.PARAM_SPEC, (paramSpec: MessageParamSpecEntry, paramName: MessageParamNames<T>) => {
		if (isServer && paramSpec.noServer) {
			return;
		}
		if (!isServer && paramSpec.noClient) {
			return;
		}
		if (paramName in params) {
			const param: string | undefined = params[paramName];
			if (param !== undefined) {
				if (type.checkParam(param, paramSpec, serverProperties)) {
					parsedParams[paramName] = {
						value: param,
						trailing: Boolean(paramSpec.trailing)
					};
				} else if (!paramSpec.optional) {
					throw new Error(`required parameter "${paramName}" did not suit requirements: "${param}"`);
				}
			}
		}
		if (!(paramName in parsedParams) && !paramSpec.optional) {
			throw new Error(`required parameter "${paramName}" not found in command "${type.COMMAND}"`);
		}
	});

	Object.assign(message, parsedParams);

	message._initPrefixAndTags(prefix, tags);
	return message;
}

// tslint:disable-next-line:no-any
export default class Message<T extends Message<T> = any, X extends Exclude<keyof T, keyof Message> = never> {
	static readonly COMMAND: string = '';
	// tslint:disable-next-line:no-any
	static readonly PARAM_SPEC: MessageParamSpec<any>;
	static readonly SUPPORTS_CAPTURE: boolean = false;

	protected _tags: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: MessageParam[] = [];
	protected _serverProperties: ServerProperties = defaultServerProperties;

	private readonly _raw?: string;

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

		return [...this._tags.entries()].map(([key, value]) => value ? `${key}=${escapeTag(value)}` : key).join(';');
	}

	toString(complete: boolean = false): string {
		const cls = this.constructor as MessageConstructor<T>;
		const specKeys: Array<MessageParamNames<T>> = ObjectTools.keys(cls.PARAM_SPEC);
		const fullCommand = [this._command, ...specKeys.map((paramName: MessageParamNames<T>): string | undefined => {
			// TS inference does really not help here... so this is any for now
			// tslint:disable-next-line:no-any
			const param: MessageParam = (this as any)[paramName];
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
		isServer: boolean = false,
		shouldParseParams: boolean = true
	) {
		this._command = command;
		this._params = params;
		this._tags = tags || new Map<string, string>();
		this._prefix = prefix;
		this._serverProperties = serverProperties;
		this._raw = rawLine;

		if (shouldParseParams) {
			this.parseParams(isServer);
		}
	}

	/** @private */
	_initPrefixAndTags(prefix?: MessagePrefix, tags?: Map<string, string>) {
		this._prefix = prefix;
		if (tags) {
			this._tags = tags;
		}
	}

	parseParams(isServer: boolean = false) {
		if (this._params) {
			const cls = this.constructor as MessageConstructor<T>;
			let requiredParamsLeft = cls.getMinParamCount(isServer);
			if (requiredParamsLeft > this._params.length) {
				throw new NotEnoughParametersError(this._command, requiredParamsLeft, this._params.length);
			}

			const paramSpecList = cls.PARAM_SPEC;
			if (!paramSpecList) {
				return;
			}
			let i = 0;
			const parsedParams: Partial<MessageParams<T>> = {};
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
					parsedParams[paramName as keyof MessageParamSpec<T>] = { ...param };
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

			Object.assign(this, parsedParams);
		}
	}

	static getMinParamCount(isServer: boolean = false): number {
		if (!this.PARAM_SPEC) {
			return 0;
		}

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

	get params(): MessageParamValues<T, X> {
		const cls = this.constructor as MessageConstructor<T>;
		const specKeys: Array<MessageParamNames<T>> = ObjectTools.keys(cls.PARAM_SPEC);
		return Object.assign(
			{},
			...specKeys.map((paramName: MessageParamNames<T>): [MessageParamNames<T>, string] | undefined => {
				// TS inference does really not help here... so this is any for now
				// tslint:disable-next-line:no-any
				const param: MessageParam = (this as any)[paramName];

				if (param) {
					return [paramName, param.value];
				}
			}).filter(pair => pair !== undefined).map(([key, value]) => ({ [key]: value }))
		);
	}

	get prefix(): MessagePrefix | undefined {
		return this._prefix;
	}

	get command(): string {
		return this._command;
	}

	get tags() {
		return this._tags;
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
