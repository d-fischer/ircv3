import Message, { MessageConstructor } from './Message/Message';
import * as MessageTypes from './Message/MessageTypes';
import Capability from './Capability/Capability';
import * as CoreCapabilities from './Capability/CoreCapabilities';
import ObjectTools from './Toolkit/ObjectTools';

ObjectTools.forEach(MessageTypes.Commands, (type: MessageConstructor) => {
	Message.registerType(type);
});

ObjectTools.forEach(MessageTypes.Numerics, (type: MessageConstructor) => {
	Message.registerType(type);
});

ObjectTools.forEach(CoreCapabilities, (cap: Capability) => {
	if (cap.messageTypes) {
		for (const messageType of cap.messageTypes) {
			Message.registerType(messageType);
		}
	}
});

export { default as Client } from './Client';
export { Message, MessageTypes };
export { Capability, CoreCapabilities };
