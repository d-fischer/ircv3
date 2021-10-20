import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('302')
export class Reply302UserHost extends Message<Reply302UserHost> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	hosts!: MessageParam;
}
