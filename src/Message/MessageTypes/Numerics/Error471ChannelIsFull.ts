import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('471')
export class Error471ChannelIsFull extends Message<Error471ChannelIsFull> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({ type: 'channel' })
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
