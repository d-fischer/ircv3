import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PART')
export class ChannelPart extends Message<ChannelPart> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	reason?: MessageParam;
}
