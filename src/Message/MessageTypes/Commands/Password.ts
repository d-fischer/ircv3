import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PASS')
export class Password extends Message<Password> {
	@MessageParamDefinition({})
	password!: MessageParam;
}
