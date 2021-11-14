import type { MessageConstructor, MessageParamSpecEntry } from './Message';
import { Message } from './Message';

// eslint-disable-next-line @typescript-eslint/ban-types
const isMessageType = (ctor: Function): ctor is MessageConstructor =>
	Object.prototype.isPrototypeOf.call(Message, ctor);

export const MessageType =
	(commandName: string): ClassDecorator =>
	target => {
		if (!isMessageType(target)) {
			throw new Error('You need to extend the Message class to use the MessageType decorator');
		}

		target.COMMAND = commandName;
	};

export const MessageParamDefinition =
	(spec: MessageParamSpecEntry = {}): PropertyDecorator =>
	(target, propertyKey) => {
		if (!(target instanceof Message)) {
			throw new Error('You need to extend the Message class to use the MessageParam decorator');
		}

		if (typeof propertyKey !== 'string') {
			return;
		}

		const cls = target.constructor as MessageConstructor;
		(cls.PARAM_SPEC ??= {})[propertyKey] = spec;
	};
