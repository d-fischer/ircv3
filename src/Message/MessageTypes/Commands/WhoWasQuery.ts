import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHOWAS')
export class WhoWasQuery extends Message<WhoWasQuery> {
	@MessageParamDefinition({})
	nickname!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	count!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	server!: MessageParam;
}
