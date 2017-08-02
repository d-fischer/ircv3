import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface UserRegistrationParams {
	user: MessageParam;
	mode: MessageParam;
	unused: MessageParam;
	realName: MessageParam;
}

export default class UserRegistration extends Message<UserRegistrationParams> {
	public static readonly COMMAND = 'USER';
	public static readonly PARAM_SPEC: MessageParamSpec<UserRegistrationParams> = {
		user: {},
		mode: {},
		unused: {},
		realName: {
			trailing: true
		},
	};
}
