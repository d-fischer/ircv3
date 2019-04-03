import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('OPER')
export default class OperLogin extends Message<OperLogin> {
	@MessageParamDefinition({})
	name!: MessageParam;

	@MessageParamDefinition({})
	password!: MessageParam;
}
