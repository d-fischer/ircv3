import Message, { MessageParam } from '../../../../../Message/Message';
import { MessageParamDefinition, MessageType } from '../../../../../Message/MessageDefinition';

@MessageType('CHGHOST')
export default class ChgHost extends Message<ChgHost> {
	@MessageParamDefinition()
	newUser!: MessageParam;

	@MessageParamDefinition()
	newHost!: MessageParam;
}
