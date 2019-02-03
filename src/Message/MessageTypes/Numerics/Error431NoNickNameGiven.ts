import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error431NoNickNameGivenParams {
	me: MessageParam;
	suffix: MessageParam;
}

export default class Error431NoNickNameGiven extends Message<Error431NoNickNameGivenParams> {
	static readonly COMMAND = '431';
	static readonly PARAM_SPEC: MessageParamSpec<Error431NoNickNameGiven> = {
		me: {},
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
