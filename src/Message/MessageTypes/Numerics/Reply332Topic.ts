import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('332')
export default class Reply332Topic extends Message<Reply332Topic> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	topic!: MessageParam;
}
