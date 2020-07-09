import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('LIST')
export class ChannelList extends Message<ChannelList> {
	@MessageParamDefinition({
		type: 'channel',
		optional: true
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	server!: MessageParam;
}
