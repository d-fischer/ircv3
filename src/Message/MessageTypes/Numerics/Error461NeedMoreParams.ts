import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('461')
export default class Error461NeedMoreParams extends Message<Error461NeedMoreParams> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	originalCommand!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
