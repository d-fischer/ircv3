import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('TAGMSG')
export class TagMessage extends Message<TagMessage> {
	@MessageParamDefinition()
	target!: MessageParam;
}
