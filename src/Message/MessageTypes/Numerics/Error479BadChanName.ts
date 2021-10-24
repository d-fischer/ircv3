import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('479')
export class Error479BadChanName extends Message<Error479BadChanName> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
