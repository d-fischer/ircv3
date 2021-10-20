import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('401')
export class Error401NoSuchNick extends Message<Error401NoSuchNick> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	nick!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
