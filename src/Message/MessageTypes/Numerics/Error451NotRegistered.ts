import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error451NotRegisteredParams {
	me: MessageParam;
	suffix: MessageParam;
}

export default class Error451NotRegistered extends Message<Error451NotRegisteredParams> {
	static readonly COMMAND = '451';
	static readonly PARAM_SPEC: MessageParamSpec<Error451NotRegistered> = {
		me: {},
		suffix: {
			trailing: true
		}
	};
}
