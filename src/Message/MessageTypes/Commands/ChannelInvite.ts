import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('INVITE')
export default class ChannelInvite extends Message<ChannelInvite> {
	@MessageParamDefinition({})
	target!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;
}
