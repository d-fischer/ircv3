import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PasswordParams {
	password: MessageParam;
}

export default class Password extends Message<PasswordParams> {
	public static readonly COMMAND = 'PASS';
	public static readonly PARAM_SPEC: MessageParamSpec<PasswordParams> = {
		password: {}
	};
}
