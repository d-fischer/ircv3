import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('JOIN')
export class ChannelJoin extends Message<ChannelJoin> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	key?: MessageParam;
}
