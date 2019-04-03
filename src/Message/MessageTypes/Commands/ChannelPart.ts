import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PART')
export default class ChannelPart extends Message<ChannelPart> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;
}
