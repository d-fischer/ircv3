import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('NICK')
export class NickChange extends Message<NickChange> {
	@MessageParamDefinition()
	nick!: MessageParam;
}
