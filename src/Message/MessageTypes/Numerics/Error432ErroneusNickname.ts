import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

// misspelt for historical reasons
@MessageType('432')
export class Error432ErroneusNickname extends Message<Error432ErroneusNickname> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	nick!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage.command === 'NICK';
	}

	endsResponseTo(): boolean {
		return true;
	}
}
