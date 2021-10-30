import type { MessageParam } from '../../../../../Message/Message';
import { Message } from '../../../../../Message/Message';
import { MessageParamDefinition, MessageType } from '../../../../../Message/MessageDefinition';

@MessageType('BATCH')
export class Batch extends Message<Batch> {
	@MessageParamDefinition()
	reference!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	type?: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	additionalParams?: MessageParam;
}
