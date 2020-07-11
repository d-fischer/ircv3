import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('221')
export class Reply221UmodeIs extends Message<Reply221UmodeIs> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	modes!: MessageParam;
}
