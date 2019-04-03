import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WHOWAS')
export default class WhoWasQuery extends Message<WhoWasQuery> {
	@MessageParamDefinition({})
	nickname!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	count!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	server!: MessageParam;
}
