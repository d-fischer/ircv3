import { forEachObjectEntry } from '@d-fischer/shared-utils';
import { NotEnoughParametersError } from '../Errors/NotEnoughParametersError';
import { ParameterRequirementMismatchError } from '../Errors/ParameterRequirementMismatchError';
import { defaultServerProperties, type ServerProperties } from '../ServerProperties';
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

export interface BaseMessageParamSpecEntry {
	trailing?: boolean;
	rest?: boolean;
	noClient?: boolean;
	noServer?: boolean;
	type?: 'channel' | 'channelList';
	match?: RegExp;
}

export interface RequiredMessageParamSpecEntry extends BaseMessageParamSpecEntry {
	optional?: false;
}

export interface OptionalMessageParamSpecEntry extends BaseMessageParamSpecEntry {
	optional: true;
}

export type MessageParamSpecEntry<Optional extends boolean = boolean> = Optional extends true
	? OptionalMessageParamSpecEntry
	: RequiredMessageParamSpecEntry;

export type MessageParamSpecEntryFor<T extends string | undefined> = undefined extends T
	? T extends undefined
		? never
		: MessageParamSpecEntry<true>
	: MessageParamSpecEntry<false>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type MessageFields<T extends {}> = { [K in keyof T]?: string };
export type MessageParamSpec<Fields extends MessageFields<Fields>> = {
	[K in Extract<keyof Fields, string>]-?: MessageParamSpecEntryFor<Fields[K]>;
};

export interface MessageInternalContents {
	params?: MessageParam[];
	tags?: Map<string, string>;
	prefix?: MessagePrefix;
	rawLine?: string;
}

export interface MessageInternalConfig {
	serverProperties?: ServerProperties;
	isServer?: boolean;
	shouldParseParams?: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface MessageConstructor<T extends Message = Message> extends Function {
	COMMAND: string;
	SUPPORTS_CAPTURE: boolean;

	checkParam: (param: string, spec: MessageParamSpecEntry, serverProperties?: ServerProperties) => boolean;

	new (command: string, contents?: MessageInternalContents, config?: MessageInternalConfig): T;
}

export type MessageParamNames<Fields extends MessageFields<Fields>> = Extract<keyof Fields, string>;
export type MessageParams<Fields extends MessageFields<Fields>> = { [K in MessageParamNames<Fields>]: MessageParam };
export type MessageFieldsFromType<T extends Message> = T extends Message<infer Fields>
	? Fields extends MessageFields<Fields>
		? Fields
		: never
	: never;

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

export function createMessage<T extends Message>(
	type: MessageConstructor<T>,
	params: Partial<MessageFieldsFromType<T>>,
	prefix?: MessagePrefix,
	tags?: Map<string, string>,
	serverProperties: ServerProperties = defaultServerProperties,
	isServer: boolean = false
): T {
	const message: T = new type(type.COMMAND, undefined, { serverProperties });
	const parsedParams: Partial<MessageParams<MessageFieldsFromType<T>>> = {};
	if (message._paramSpec) {
		forEachObjectEntry(
			message._paramSpec,
			(paramSpec: MessageParamSpecEntry, paramName: MessageParamNames<MessageFieldsFromType<T>>) => {
				if (isServer && paramSpec.noServer) {
					return;
				}
				if (!isServer && paramSpec.noClient) {
					return;
				}
				if (paramName in params) {
					const param = params[paramName] as string | undefined;
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
			}
		);
	}

	message._parsedParams = parsedParams;

	if (message._paramSpec) {
		for (const key of Object.keys(message._paramSpec)) {
			Object.defineProperty(message, key, {
				get(this: T): string | undefined {
					return (this._parsedParams as MessageParams<MessageFieldsFromType<T>> | undefined)?.[
						key as MessageParamNames<MessageFieldsFromType<T>>
					]?.value;
				}
			});
		}
	}

	message._initPrefixAndTags(prefix, tags);
	return message;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class Message<Fields extends MessageFields<Fields> = {}> {
	static readonly COMMAND: string = '';
	static readonly SUPPORTS_CAPTURE: boolean = false;
	readonly _paramSpec?: MessageParamSpec<Fields>;

	protected _tags: Map<string, string>;
	protected _prefix?: MessagePrefix;
	protected _command: string;
	protected _params?: MessageParam[] = [];
	/** @internal */ _parsedParams?: MessageParams<Fields>;
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

	constructor(
		command: string,
		{ params, tags, prefix, rawLine }: MessageInternalContents = {},
		{
			serverProperties = defaultServerProperties,
			isServer = false,
			shouldParseParams = true
		}: MessageInternalConfig = {},
		paramSpec?: MessageParamSpec<Fields>
	) {
		this._paramSpec = paramSpec;
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

	getMinParamCount(isServer: boolean = false): number {
		if (!this._paramSpec) {
			return 0;
		}

		return Object.values<MessageParamSpecEntry>(this._paramSpec).filter(spec => {
			if (spec.noServer && isServer) {
				return false;
			}
			if (spec.noClient && !isServer) {
				return false;
			}
			return !spec.optional;
		}).length;
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
			let requiredParamsLeft = this.getMinParamCount(isServer);
			if (requiredParamsLeft > this._params.length) {
				throw new NotEnoughParametersError(this._command, requiredParamsLeft, this._params.length);
			}

			const paramSpecList = this._paramSpec;
			if (!paramSpecList) {
				return;
			}
			let i = 0;
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			const parsedParams = {} as MessageParams<Fields>;
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
					parsedParams[paramName as MessageParamNames<Fields>] = { ...param };
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

			this._parsedParams = parsedParams;

			if (this._paramSpec) {
				for (const key of Object.keys(this._paramSpec)) {
					Object.defineProperty(this, key, {
						get(this: Message<Fields>): string | undefined {
							return this._parsedParams?.[key as MessageParamNames<Fields>]?.value;
						}
					});
				}
			}
		}
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
		const specKeys = this._paramSpec ? (Object.keys(this._paramSpec) as Array<Extract<keyof Fields, string>>) : [];
		return [
			this._command,
			...specKeys
				.map((paramName: MessageParamNames<Fields>): string | undefined => {
					const param = this._parsedParams?.[paramName];
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
