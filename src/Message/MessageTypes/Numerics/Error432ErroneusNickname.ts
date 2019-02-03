import Message, { MessageParam, MessageParamSpec } from '../../Message';

// misspelt for historical reasons
export interface Error432ErroneusNicknameParams {
	me: MessageParam;
	nick: MessageParam;
	suffix: MessageParam;
}

export default class Error432ErroneusNickname extends Message<Error432ErroneusNicknameParams> {
	static readonly COMMAND = '432';
	static readonly PARAM_SPEC: MessageParamSpec<Error432ErroneusNickname> = {
		me: {},
		nick: {},
		suffix: {
			trailing: true
		}
	};

	protected isResponseTo(originalMessage: Message) {
		return originalMessage.command === 'NICK';
	}

	endsResponseTo(originalMessage: Message) {
		return true;
	}
}
