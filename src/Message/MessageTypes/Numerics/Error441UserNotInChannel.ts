import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error441UserNotInChannelParams {
	me: MessageParam;
	nick: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error441UserNotInChannel extends Message<Error441UserNotInChannelParams> {
	static readonly COMMAND = '441';
	static readonly PARAM_SPEC: MessageParamSpec<Error441UserNotInChannel> = {
		me: {},
		nick: {},
		channel: {
			type: 'channel'
		},
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
