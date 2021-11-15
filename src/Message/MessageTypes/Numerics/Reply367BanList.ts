import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('367')
export class Reply367BanList extends Message<Reply367BanList> {
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
