import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('436')
export default class Error436NickCollision extends Message<Error436NickCollision> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	nick!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	protected isResponseTo(originalMessage: Message) {
		return originalMessage.command === 'NICK';
	}

	endsResponseTo(originalMessage: Message) {
		return true;
	}
}
