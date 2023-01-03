import type { AllowedNames, NoInfer } from '@d-fischer/shared-utils';
import { forEachObjectEntry } from '@d-fischer/shared-utils';
import { NotEnoughParametersError } from '../Errors/NotEnoughParametersError';
import { ParameterRequirementMismatchError } from '../Errors/ParameterRequirementMismatchError';
import type { ServerProperties } from '../ServerProperties';
import { defaultServerProperties } from '../ServerProperties';
import { isChannel } from '../Toolkit/StringTools';

export interface MessagePrefix {
	nick: string;
	user?: string;
	host?: string;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MessageConstructor<T extends Message<T> = any> extends Function {
	COMMAND: string;
	PARAM_SPEC?: MessageParamSpec<NoInfer<T>>;
	SUPPORTS_CAPTURE: boolean;

	getMinParamCount: (isServer?: boolean) => number;
	checkParam: (param: string, spec: MessageParamSpecEntry, serverProperties?: ServerProperties) => boolean;

	new (
		command: string,
		params?: MessageParam[],
		tags?: Map<string, string>,
		prefix?: MessagePrefix,
		serverProperties?: ServerProperties,
		rawLine?: string,
		isServer?: boolean,
		shouldParseParams?: boolean
	): T;
}

export type MessageParamNames<T extends Message<T>> = AllowedNames<Omit<T, 'params'>, MessageParam | undefined>;
export type MessageParams<T extends Message<T>> = Record<MessageParamNames<T>, MessageParam>;
export type MessageParamValues<T extends Message<T>> = Pick<
	{
		[K in keyof T]: string | Extract<T[K], undefined>;
	},
	MessageParamNames<T>
>;
export type MessageParamSpec<T extends Message<T>> = Record<MessageParamNames<T>, MessageParamSpecEntry>;

/* eslint-disable @typescript-eslint/naming-convention */
const tagEscapeMap: Record<string, string> = {
	'\\': '\\',
	';': ':',
	'\n': 'n',
	'\r': 'r',
	' ': 's'
};
/* eslint-enable @typescript-eslint/naming-convention */

function escapeTag(str: string) {
	return str.replace(/[\\;\n\r ]/g, match => `\\${tagEscapeMap[match]}`);
}

export function prefixToString(prefix: MessagePrefix): string {
	let result = `${prefix.nick}`;
	if (prefix.user) {
		result += `!${prefix.user}`;
	}
	if (prefix.host) {
		result += `@${prefix.host}`;
	}

	return result;
}

export function createMessage<T extends Message<T>>(
	type: MessageConstructor<T>,
	params: Partial<MessageParamValues<T>>,
	prefix?: MessagePrefix,
	tags?: Map<string, string>,
	serverProperties: ServerProperties = defaultServerProperties,
	isServer: boolean = false
): T {
	const message: T = new type(type.COMMAND, undefined, undefined, undefined, serverProperties);
	const parsedParams: Partial<MessageParams<T>> = {};
	if (type.PARAM_SPEC) {
		forEachObjectEntry(type.PARAM_SPEC, (paramSpec: MessageParamSpecEntry, paramName: MessageParamNames<T>) => {
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
	}

	Object.assign(message, parsedParams);

	message._initPrefixAndTags(prefix, tags);
	return message;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Message<T extends Message<T> = any> {
	static readonly COMMAND: string = '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static readonly PARAM_SPEC: MessageParamSpec<any>;
	static readonly SUPPORTS_CAPTURE: boolean = false;

	protected _tags: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: MessageParam[] = [];
	protected _serverProperties: ServerProperties = defaultServerProperties;

	private readonly _raw?: string;

	static checkParam(
		param: string,
		spec: MessageParamSpecEntry,
		serverProperties: ServerProperties = defaultServerProperties
	): boolean {
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

	static getMinParamCount(isServer: boolean = false): number {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
		this._tags = tags ?? new Map<string, string>();
		this._prefix = prefix;
		this._serverProperties = serverProperties;
		this._raw = rawLine;

		if (shouldParseParams) {
			this.parseParams(isServer);
		}
	}

	get paramCount(): number {
		return this._params?.length ?? 0;
	}

	prefixToString(): string {
		if (!this._prefix) {
			return '';
		}

		return prefixToString(this._prefix);
	}

	tagsToString(): string {
		return [...this._tags.entries()].map(([key, value]) => (value ? `${key}=${escapeTag(value)}` : key)).join(';');
	}

	toString(includePrefix: boolean = false, fromRawParams: boolean = false): string {
		const fullCommand = fromRawParams ? this._buildCommandFromRawParams() : this._buildCommandFromNamedParams();
		const parts = [fullCommand];

		if (includePrefix) {
			const prefix = this.prefixToString();
			if (prefix) {
				parts.unshift(`:${prefix}`);
			}
		}

		const tags = this.tagsToString();
		if (tags) {
			parts.unshift(`@${tags}`);
		}

		return parts.join(' ');
	}

	/** @private */
	_initPrefixAndTags(prefix?: MessagePrefix, tags?: Map<string, string>): void {
		this._prefix = prefix;
		if (tags) {
			this._tags = tags;
		}
	}

	parseParams(isServer: boolean = false): void {
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
				if (this._params.length - i <= requiredParamsLeft) {
					if (paramSpec.optional) {
						continue;
					} else if (this._params.length - i !== requiredParamsLeft) {
						throw new Error(
							'not enough parameters left for required parameters parsing (this is a library bug)'
						);
					}
				}
				let param: MessageParam = this._params[i];
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

	get params(): MessageParamValues<T> {
		const cls = this.constructor as MessageConstructor<T>;
		const specKeys = cls.PARAM_SPEC ? (Object.keys(cls.PARAM_SPEC) as Array<MessageParamNames<T>>) : [];
		return Object.assign(
			{},
			...specKeys
				.map((paramName: MessageParamNames<T>): [MessageParamNames<T>, string] | undefined => {
					// TS inference does really not help here... so this is any for now
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const param: MessageParam = (this as Record<MessageParamNames<T>, MessageParam>)[paramName];

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (param) {
						return [paramName, param.value];
					}

					return undefined;
				})
				.filter((pair): pair is [MessageParamNames<T>, string] => pair !== undefined)
				.map(([key, value]) => ({ [key]: value }))
		) as MessageParamValues<T>;
	}

	get rawParamValues(): string[] {
		return this._params?.map(param => param.value) ?? [];
	}

	get prefix(): MessagePrefix | undefined {
		return this._prefix;
	}

	get command(): string {
		return this._command;
	}

	get tags(): Map<string, string> {
		return this._tags;
	}

	get rawLine(): string | undefined {
		return this._raw;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isResponseTo(originalMessage: Message): boolean {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	endsResponseTo(originalMessage: Message): boolean {
		return false;
	}
	_acceptsInReplyCollection(message: Message): boolean {
		// TODO implement IRCv3 labeled-response / batch here
		return message.isResponseTo(this);
	}

	private _buildCommandFromNamedParams(): string {
		const cls = this.constructor as MessageConstructor<T>;
		const specKeys = cls.PARAM_SPEC ? (Object.keys(cls.PARAM_SPEC) as Array<MessageParamNames<T>>) : [];
		return [
			this._command,
			...specKeys
				.map((paramName: MessageParamNames<T>): string | undefined => {
					// TS inference does really not help here... so this is any for now
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const param: MessageParam = (this as Record<MessageParamNames<T>, MessageParam>)[paramName];
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (param) {
						return (param.trailing ? ':' : '') + param.value;
					}

					return undefined;
				})
				.filter((param: string | undefined) => param !== undefined)
		].join(' ');
	}

	private _buildCommandFromRawParams(): string {
		return [
			this._command,
			...(this._params?.map(param => `${param.trailing ? ':' : ''}${param.value}`) ?? [])
		].join(' ');
	}
}
