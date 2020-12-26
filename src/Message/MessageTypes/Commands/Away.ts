import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('AWAY')
export class Away extends Message<Away> {
	@MessageParamDefinition()
	message!: MessageParam;
}
