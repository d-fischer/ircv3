import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('AWAY')
export class Away extends Message<Away> {
	@MessageParamDefinition()
	message!: MessageParam;
}
