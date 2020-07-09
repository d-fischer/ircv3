import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('333')
export class Reply333TopicWhoTime extends Message<Reply333TopicWhoTime> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({})
	who!: MessageParam;

	@MessageParamDefinition({})
	ts!: MessageParam;
}
