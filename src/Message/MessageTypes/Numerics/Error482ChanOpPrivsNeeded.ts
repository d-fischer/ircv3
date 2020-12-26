import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('482')
export class Error482ChanOpPrivsNeeded extends Message<Error482ChanOpPrivsNeeded> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
