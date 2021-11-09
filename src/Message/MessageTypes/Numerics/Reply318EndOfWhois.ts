import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('318')
export class Reply318EndOfWhois extends Message<Reply318EndOfWhois> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	nickMask!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
