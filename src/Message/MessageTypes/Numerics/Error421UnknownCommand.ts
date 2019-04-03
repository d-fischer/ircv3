import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('421')
export default class Error421UnknownCommand extends Message<Error421UnknownCommand> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	originalCommand!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	protected isResponseTo(originalMessage: Message) {
		return originalMessage.command === this.params.originalCommand;
	}

	endsResponseTo(originalMessage: Message) {
		return true;
	}
}
