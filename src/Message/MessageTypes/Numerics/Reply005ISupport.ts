import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('005')
export default class Reply005ISupport extends Message<Reply005ISupport> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		rest: true
	})
	supports!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
