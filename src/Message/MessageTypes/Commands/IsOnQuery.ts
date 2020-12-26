import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('ISON')
export class IsOnQuery extends Message<IsOnQuery> {
	@MessageParamDefinition({
		rest: true
	})
	nicks!: MessageParam;
}
