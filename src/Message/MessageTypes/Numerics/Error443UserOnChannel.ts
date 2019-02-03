import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error443UserOnChannelParams {
	me: MessageParam;
	nick: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error443UserOnChannel extends Message<Error443UserOnChannelParams> {
	static readonly COMMAND = '443';
	static readonly PARAM_SPEC: MessageParamSpec<Error443UserOnChannel> = {
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
