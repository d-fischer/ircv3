import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error462AlreadyRegisteredParams {
	me: MessageParam;
	text: MessageParam;
}

export default class Error462AlreadyRegistered extends Message<Error462AlreadyRegisteredParams> {
	static readonly COMMAND = '462';
	static readonly PARAM_SPEC: MessageParamSpec<Error462AlreadyRegistered> = {
		me: {},
		text: {
			trailing: true
		}
	};
}
