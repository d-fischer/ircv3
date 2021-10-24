import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('391')
export class Reply391Time extends Message<Reply391Time> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	server!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	timestamp!: MessageParam;
}
