import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply001WelcomeParams {
	me: MessageParam;
	welcomeText: MessageParam;
}

export default class Reply001Welcome extends Message<Reply001WelcomeParams> {
	static readonly COMMAND = '001';
	static readonly PARAM_SPEC: MessageParamSpec<Reply001Welcome> = {
		me: {},
		welcomeText: {
			trailing: true
		}
	};
}
