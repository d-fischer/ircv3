import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('JOIN')
export default class ChannelJoin extends Message<ChannelJoin> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	key?: MessageParam;
}
