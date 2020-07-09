import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHO')
export class WhoQuery extends Message<WhoQuery> {
	@MessageParamDefinition({
		optional: true
	})
	mask!: MessageParam;

	@MessageParamDefinition({
		rest: true
	})
	flags!: MessageParam;
}
