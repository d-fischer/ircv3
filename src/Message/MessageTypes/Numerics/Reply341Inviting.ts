import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('341')
export class Reply341Inviting extends Message<Reply341Inviting> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	nick!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;
}
