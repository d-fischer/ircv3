import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('474')
export class Error474BannedFromChan extends Message<Error474BannedFromChan> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({ type: 'channel' })
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
