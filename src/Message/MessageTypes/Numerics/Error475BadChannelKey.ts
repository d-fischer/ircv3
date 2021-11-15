import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('475')
export class Error475BadChannelKey extends Message<Error475BadChannelKey> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({ type: 'channel' })
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
