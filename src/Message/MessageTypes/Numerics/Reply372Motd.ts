import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('372')
export class Reply372Motd extends Message<Reply372Motd> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	line!: MessageParam;
}
