import Message, {MessageParam, MessageParamSpec} from '../Message';

export interface OperLoginParams {
	name: MessageParam;
	password: MessageParam;
}

export default class OperLogin extends Message<OperLoginParams> {
	public static readonly COMMAND = 'OPER';
	public static readonly PARAM_SPEC: MessageParamSpec<OperLoginParams> = {
		name: {},
		password: {}
	};
}
