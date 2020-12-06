export { IrcClient } from './IrcClient';

export * as CoreCapabilities from './Capability/CoreCapabilities';
export type { Capability } from './Capability/Capability';

export { Message, prefixToString } from './Message/Message';
export type { MessageConstructor, MessageParam, MessageParamSpec, MessagePrefix } from './Message/Message';
export { MessageType, MessageParamDefinition } from './Message/MessageDefinition';
export { parseMessage, parsePrefix, parseTags } from './Message/MessageParser';
export * as MessageTypes from './Message/MessageTypes';
export type { SingleMode } from './Message/MessageTypes/Commands/Mode';

export { defaultServerProperties } from './ServerProperties';
export type { AccessLevelDefinition } from './ServerProperties';
export type { SupportedModesByType, ServerProperties } from './ServerProperties';

export { isChannel } from './Toolkit/StringTools';

export { MessageError } from './Errors/MessageError';
export { NotEnoughParametersError } from './Errors/NotEnoughParametersError';
export { ParameterRequirementMismatchError } from './Errors/ParameterRequirementMismatchError';
export { UnknownChannelModeCharError } from './Errors/UnknownChannelModeCharError';
