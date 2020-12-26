import type { MessageParam } from '../../../../../Message/Message';
import { Message } from '../../../../../Message/Message';
import { MessageParamDefinition, MessageType } from '../../../../../Message/MessageDefinition';

@MessageType('CHGHOST')
export class ChgHost extends Message<ChgHost> {
	@MessageParamDefinition()
	newUser!: MessageParam;

	@MessageParamDefinition()
	newHost!: MessageParam;
}
