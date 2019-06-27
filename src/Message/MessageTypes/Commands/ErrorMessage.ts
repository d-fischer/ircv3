import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('ERROR')
export default class ErrorMessage extends Message<ErrorMessage> {
	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
