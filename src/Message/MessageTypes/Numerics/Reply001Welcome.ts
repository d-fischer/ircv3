import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply001WelcomeParams {
	me: MessageParam;
	welcomeText: MessageParam;
}

export default class Reply001Welcome extends Message<Reply001WelcomeParams> {
	public static readonly COMMAND = '001';
	public static readonly PARAM_SPEC: MessageParamSpec<Reply001WelcomeParams> = {
		me: {},
		welcomeText: {
			trailing: true
		}
	};
}
