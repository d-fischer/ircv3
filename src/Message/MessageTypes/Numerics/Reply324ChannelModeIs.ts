import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('324')
export class Reply324ChannelModeIs extends Message<Reply324ChannelModeIs> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		rest: true
	})
	modes!: MessageParam;
}
