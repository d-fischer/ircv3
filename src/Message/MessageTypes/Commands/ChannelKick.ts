import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ChannelKickParams {
	channel: MessageParam;
	target: MessageParam;
	comment: MessageParam;
}

export default class ChannelKick extends Message<ChannelKickParams> {
	static readonly COMMAND = 'KICK';
	static readonly PARAM_SPEC: MessageParamSpec<ChannelKick> = {
		channel: {
			type: 'channel'
		},
		target: {},
		comment: {
			trailing: true,
			optional: true
		}
	};
}
