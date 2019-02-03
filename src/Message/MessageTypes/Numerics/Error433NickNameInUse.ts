import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error433NickNameInUseParams {
	me: MessageParam;
	nick: MessageParam;
	suffix: MessageParam;
}

export default class Error433NickNameInUse extends Message<Error433NickNameInUseParams> {
	static readonly COMMAND = '433';
	static readonly PARAM_SPEC: MessageParamSpec<Error433NickNameInUse> = {
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
