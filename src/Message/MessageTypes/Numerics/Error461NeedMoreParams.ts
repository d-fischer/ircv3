import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error461NeedMoreParamsParams {
	me: MessageParam;
	command: MessageParam;
	suffix: MessageParam;
}

export default class Error461NeedMoreParams extends Message<Error461NeedMoreParamsParams> {
	public static readonly COMMAND = '461';
	public static readonly PARAM_SPEC: MessageParamSpec<Error461NeedMoreParamsParams> = {
		me: {},
		command: {},
		suffix: {
			trailing: true
		}
	};
}
