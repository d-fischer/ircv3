import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('USER')
export default class UserRegistration extends Message<UserRegistration> {
	@MessageParamDefinition({})
	user!: MessageParam;

	@MessageParamDefinition({})
	mode!: MessageParam;

	@MessageParamDefinition({})
	unused!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	realName!: MessageParam;
}
