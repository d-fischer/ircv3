import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface ChannelJoinParams {
	channel: MessageParam;
	key: MessageParam;
}

export default class ChannelJoin extends Message<ChannelJoinParams> {
	public static readonly COMMAND = 'JOIN';
	public static readonly PARAM_SPEC: MessageParamSpec<ChannelJoinParams> = {
		channel: {
			type: 'channel'
		},
		key: {
			optional: true
		}
	};
}
