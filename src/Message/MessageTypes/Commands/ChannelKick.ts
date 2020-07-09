import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('KICK')
export class ChannelKick extends Message<ChannelKick> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({})
	target!: MessageParam;

	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	comment!: MessageParam;
}
