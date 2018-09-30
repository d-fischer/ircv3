import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error461NeedMoreParamsParams {
	me: MessageParam;
	command: MessageParam;
	suffix: MessageParam;
}

export default class Error461NeedMoreParams extends Message<Error461NeedMoreParamsParams> {
	static readonly COMMAND = '461';
	static readonly PARAM_SPEC: MessageParamSpec<Error461NeedMoreParams> = {
		me: {},
		command: {},
		suffix: {
			trailing: true
		}
	};
}
