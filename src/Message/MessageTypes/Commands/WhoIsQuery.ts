import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHOIS')
export default class WhoIsQuery extends Message<WhoIsQuery> {
	@MessageParamDefinition({
		optional: true
	})
	server!: MessageParam;

	@MessageParamDefinition({})
	nickMask!: MessageParam;
}
