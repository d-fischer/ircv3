import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('301')
export class Reply301Away extends Message<Reply301Away> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	nick!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	content!: MessageParam;
}
