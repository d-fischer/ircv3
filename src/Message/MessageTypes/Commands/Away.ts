import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('AWAY')
export default class Away extends Message<Away> {
	@MessageParamDefinition()
	message!: MessageParam;
}
