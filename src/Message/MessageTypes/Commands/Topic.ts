import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('TOPIC')
export default class Topic extends Message<Topic> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		optional: true,
		trailing: true
	})
	newTopic!: MessageParam;
}
