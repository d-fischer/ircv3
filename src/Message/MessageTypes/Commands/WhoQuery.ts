import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHO')
export class WhoQuery extends Message<WhoQuery> {
	@MessageParamDefinition({
		optional: true
	})
	mask?: MessageParam;

	@MessageParamDefinition({
		rest: true
	})
	flags!: MessageParam;
}
