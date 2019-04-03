import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('NICK')
export default class NickChange extends Message<NickChange> {
	@MessageParamDefinition({})
	nick!: MessageParam;
}
