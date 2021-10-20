import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('INVITE')
export class ChannelInvite extends Message<ChannelInvite> {
	@MessageParamDefinition()
	target!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;
}
