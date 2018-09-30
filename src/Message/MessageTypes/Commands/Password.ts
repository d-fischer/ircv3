import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PasswordParams {
	password: MessageParam;
}

export default class Password extends Message<PasswordParams> {
	static readonly COMMAND = 'PASS';
	static readonly PARAM_SPEC: MessageParamSpec<Password> = {
		password: {}
	};
}
