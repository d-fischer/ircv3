import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('005')
export class Reply005Isupport extends Message<Reply005Isupport> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		rest: true
	})
	supports!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
