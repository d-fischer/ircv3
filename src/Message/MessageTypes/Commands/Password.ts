import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PASS')
export class Password extends Message<Password> {
	@MessageParamDefinition()
	password!: MessageParam;
}
