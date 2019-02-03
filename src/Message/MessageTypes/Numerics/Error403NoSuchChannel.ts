import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error403NoSuchChannelParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error403NoSuchChannel extends Message<Error403NoSuchChannelParams> {
	static readonly COMMAND = '403';
	static readonly PARAM_SPEC: MessageParamSpec<Error403NoSuchChannel> = {
		me: {},
		channel: {
			// channel type is wrong here - this numeric is also used for showing the user this is *not* a valid channel name
			// type: 'channel'
		},
		suffix: {
			trailing: true
		}
	};
}
