import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PrivateMessageParams {
	target: MessageParam;
	message: MessageParam;
}

export default class PrivateMessage extends Message<PrivateMessageParams> {
	public static readonly COMMAND = 'PRIVMSG';
	public static readonly PARAM_SPEC: MessageParamSpec<PrivateMessageParams> = {
		target: {},
		message: {
			trailing: true
		}
	};
}
