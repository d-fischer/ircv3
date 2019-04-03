import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('221')
export default class Reply221UModeIs extends Message<Reply221UModeIs> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	modes!: MessageParam;
}
