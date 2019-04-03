import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('ERROR')
export default class Error extends Message<Error> {
	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
