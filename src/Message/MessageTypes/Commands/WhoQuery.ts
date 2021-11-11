import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHO')
export class WhoQuery extends Message<WhoQuery> {
	@MessageParamDefinition()
	mask!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	flags?: MessageParam;

	@MessageParamDefinition({
		optional: true,
		trailing: true
	})
	extendedMask?: MessageParam;
}
