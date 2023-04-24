export { IrcClient } from './IrcClient';

export * as CoreCapabilities from './Capability/CoreCapabilities';
export type { Capability } from './Capability/Capability';

export { Acknowledgement } from './Capability/CoreCapabilities/LabeledResponseCapability/MessageTypes/Commands/Acknowledgement';
export { Batch } from './Capability/CoreCapabilities/BatchCapability/MessageTypes/Commands/Batch';
export { ChgHost } from './Capability/CoreCapabilities/ChgHostCapability/MessageTypes/Commands/ChgHost';

export { createMessage, Message, prefixToString } from './Message/Message';
export type {
	MessageConstructor,
	MessageFieldsFromType,
	MessageParam,
	MessageParams,
	MessageParamSpec,
	MessagePrefix,
	MessageInternalConfig,
	MessageInternalContents
} from './Message/Message';
export { parseMessage, parsePrefix, parseTags } from './Message/MessageParser';
export * as MessageTypes from './Message/MessageTypes';
export type { SingleMode } from './Message/MessageTypes/Commands/Mode';

export { defaultServerProperties } from './ServerProperties';
export type { AccessLevelDefinition } from './ServerProperties';
export type { SupportedModesByType, ServerProperties } from './ServerProperties';

export { decodeCtcp, isChannel } from './Toolkit/StringTools';

export { MessageError } from './Errors/MessageError';
export { NotEnoughParametersError } from './Errors/NotEnoughParametersError';
export { ParameterRequirementMismatchError } from './Errors/ParameterRequirementMismatchError';
export { UnknownChannelModeCharError } from './Errors/UnknownChannelModeCharError';

export type { WebSocketConnectionOptions } from '@d-fischer/connection';
