import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('OPER')
export class OperLogin extends Message<OperLogin> {
	@MessageParamDefinition({})
	name!: MessageParam;

	@MessageParamDefinition({})
	password!: MessageParam;
}
