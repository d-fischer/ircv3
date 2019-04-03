import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('473')
export default class Error473InviteOnlyChan extends Message<Error473InviteOnlyChan> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
