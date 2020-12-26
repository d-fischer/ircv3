import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('461')
export class Error461NeedMoreParams extends Message<Error461NeedMoreParams> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	originalCommand!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
