import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('376')
export class Reply376EndOfMotd extends Message<Reply376EndOfMotd> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
