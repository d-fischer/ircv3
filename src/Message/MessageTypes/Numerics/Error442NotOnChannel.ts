import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error442NotOnChannelParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error442NotOnChannel extends Message<Error442NotOnChannelParams> {
	static readonly COMMAND = '442';
	static readonly PARAM_SPEC: MessageParamSpec<Error442NotOnChannel> = {
		me: {},
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
