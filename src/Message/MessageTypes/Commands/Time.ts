import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('TIME')
export class Time extends Message<Time> {
	@MessageParamDefinition({
		optional: true
	})
	server?: MessageParam;
}
