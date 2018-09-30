import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface OperLoginParams {
	name: MessageParam;
	password: MessageParam;
}

export default class OperLogin extends Message<OperLoginParams> {
	static readonly COMMAND = 'OPER';
	static readonly PARAM_SPEC: MessageParamSpec<OperLogin> = {
		name: {},
		password: {}
	};
}
