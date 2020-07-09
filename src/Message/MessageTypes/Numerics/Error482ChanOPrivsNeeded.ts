import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('482')
export class Error482ChanOPrivsNeeded extends Message<Error482ChanOPrivsNeeded> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
