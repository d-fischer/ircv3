import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('USERHOST')
export default class UserHostQuery extends Message<UserHostQuery> {
	@MessageParamDefinition({
		rest: true
	})
	nicks!: MessageParam;
}
