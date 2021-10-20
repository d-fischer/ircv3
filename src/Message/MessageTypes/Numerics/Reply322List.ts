import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('322')
export class Reply322List extends Message<Reply322List> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition()
	memberCount!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	topic!: MessageParam;
}
