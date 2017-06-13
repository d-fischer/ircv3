import Message from './Message/Message';
import * as MessageTypes from './Message/MessageTypes';
import ObjectTools from './Toolkit/ObjectTools';

ObjectTools.forEach(MessageTypes.Commands, (type: typeof Message) => {
	Message.registerType(type);
});

ObjectTools.forEach(MessageTypes.Numerics, (type: typeof Message) => {
	Message.registerType(type);
});

export { default as Client } from './Client';
export { MessageTypes };
