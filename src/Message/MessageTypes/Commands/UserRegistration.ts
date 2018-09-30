import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface UserRegistrationParams {
	user: MessageParam;
	mode: MessageParam;
	unused: MessageParam;
	realName: MessageParam;
}

export default class UserRegistration extends Message<UserRegistrationParams> {
	static readonly COMMAND = 'USER';
	static readonly PARAM_SPEC: MessageParamSpec<UserRegistration> = {
		user: {},
		mode: {},
		unused: {},
		realName: {
			trailing: true
		}
	};
}
