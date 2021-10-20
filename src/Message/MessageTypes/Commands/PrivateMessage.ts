import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PRIVMSG')
export class PrivateMessage extends Message<PrivateMessage> {
	@MessageParamDefinition()
	target!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	content!: MessageParam;
}
