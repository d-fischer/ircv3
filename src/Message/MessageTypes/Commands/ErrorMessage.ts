import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('ERROR')
export class ErrorMessage extends Message<ErrorMessage> {
	@MessageParamDefinition({
		trailing: true
	})
	content!: MessageParam;
}
