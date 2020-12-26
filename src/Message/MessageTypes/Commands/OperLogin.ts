import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('OPER')
export class OperLogin extends Message<OperLogin> {
	@MessageParamDefinition({})
	name!: MessageParam;

	@MessageParamDefinition({})
	password!: MessageParam;
}
