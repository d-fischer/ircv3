import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('441')
export class Error441UserNotInChannel extends Message<Error441UserNotInChannel> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	nick!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	isResponseTo(originalMessage: Message) {
		return originalMessage.command === 'NICK';
	}

	endsResponseTo(originalMessage: Message) {
		return true;
	}
}
