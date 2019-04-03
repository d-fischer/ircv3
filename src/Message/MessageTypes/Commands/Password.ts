import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PASS')
export default class Password extends Message<Password> {
	@MessageParamDefinition({})
	password!: MessageParam;
}
