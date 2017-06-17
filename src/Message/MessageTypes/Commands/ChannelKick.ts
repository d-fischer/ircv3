import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface ChannelKickParams {
	channel: MessageParam;
	target: MessageParam;
	comment: MessageParam;
}

export default class ChannelKick extends Message<ChannelKickParams> {
	public static readonly COMMAND = 'KICK';
	public static readonly PARAM_SPEC: MessageParamSpec<ChannelKickParams> = {
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
