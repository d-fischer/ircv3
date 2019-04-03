import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('KILL')
export default class Kill extends Message<Kill> {
	@MessageParamDefinition({})
	target!: MessageParam;

	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	comment!: MessageParam;
}
