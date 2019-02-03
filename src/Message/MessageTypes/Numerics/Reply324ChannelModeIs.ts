import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply324ChannelModeIsParams {
	me: MessageParam;
	channel: MessageParam;
	modes: MessageParam;
}

export default class Reply324ChannelModeIs extends Message<Reply324ChannelModeIsParams> {
	static readonly COMMAND = '324';
	static readonly PARAM_SPEC: MessageParamSpec<Reply324ChannelModeIs> = {
		me: {},
		channel: {
			type: 'channel'
		},
		modes: {
			rest: true
		}
	};
}
