import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('375')
export class Reply375MotdStart extends Message<Reply375MotdStart> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
