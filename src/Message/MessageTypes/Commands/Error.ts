import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ErrorParams {
	message: MessageParam;
}

export default class Error extends Message<ErrorParams> {
	static readonly COMMAND = 'ERROR';
	static readonly PARAM_SPEC: MessageParamSpec<Error> = {
		message: {
			trailing: true
		}
	};
}
