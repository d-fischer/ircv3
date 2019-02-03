import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error436NickCollisionParams {
	me: MessageParam;
	nick: MessageParam;
	suffix: MessageParam;
}

export default class Error436NickCollision extends Message<Error436NickCollisionParams> {
	static readonly COMMAND = '436';
	static readonly PARAM_SPEC: MessageParamSpec<Error436NickCollision> = {
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
