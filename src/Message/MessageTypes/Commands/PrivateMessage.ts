import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PrivateMessageParams {
	target: MessageParam;
	message: MessageParam;
}

export default class PrivateMessage extends Message<PrivateMessageParams> {
	static readonly COMMAND = 'PRIVMSG';
	static readonly PARAM_SPEC: MessageParamSpec<PrivateMessage> = {
		target: {},
		message: {
			trailing: true
		}
	};
}
