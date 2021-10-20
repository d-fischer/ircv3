import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHOIS')
export class WhoIsQuery extends Message<WhoIsQuery> {
	@MessageParamDefinition({
		optional: true
	})
	server?: MessageParam;

	@MessageParamDefinition()
	nickMask!: MessageParam;
}
