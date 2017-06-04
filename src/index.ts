import Message from './Message/Message';
import * as MessageTypes from './Message/MessageTypes';
import ObjectTools from './Toolkit/ObjectTools';

ObjectTools.forEach(MessageTypes, (type: typeof Message) => {
	Message.registerType(type);
});

export { default as Client } from './Client';
export { MessageTypes };
