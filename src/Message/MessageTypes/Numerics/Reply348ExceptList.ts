import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('348')
export class Reply348ExceptList extends Message<Reply348ExceptList> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition()
	mask!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	creatorName?: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	timestamp?: MessageParam;
}
