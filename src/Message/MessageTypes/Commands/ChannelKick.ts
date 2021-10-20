import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('KICK')
export class ChannelKick extends Message<ChannelKick> {
	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition()
	target!: MessageParam;

	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	comment?: MessageParam;
}
