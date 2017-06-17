import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface ChannelInviteParams {
	target: MessageParam;
	channel: MessageParam;
}

export default class ChannelInvite extends Message<ChannelInviteParams> {
	public static readonly COMMAND = 'INVITE';
	public static readonly PARAM_SPEC: MessageParamSpec<ChannelInviteParams> = {
		target: {},
		channel: {
			type: 'channel'
		}
	};
}
