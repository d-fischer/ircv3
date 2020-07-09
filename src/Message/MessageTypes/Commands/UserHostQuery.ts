import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('USERHOST')
export class UserHostQuery extends Message<UserHostQuery> {
	@MessageParamDefinition({
		rest: true
	})
	nicks!: MessageParam;
}
