import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('421')
export class Error421UnknownCommand extends Message<Error421UnknownCommand> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	originalCommand!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage.command === this.params.originalCommand;
	}

	endsResponseTo(): boolean {
		return true;
	}
}
