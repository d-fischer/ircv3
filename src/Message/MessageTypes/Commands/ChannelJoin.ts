import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ChannelJoinParams {
	channel: MessageParam;
	key: MessageParam;
}

export default class ChannelJoin extends Message<ChannelJoinParams> {
	static readonly COMMAND = 'JOIN';
	static readonly PARAM_SPEC: MessageParamSpec<ChannelJoin> = {
		channel: {
			type: 'channel'
		},
		key: {
			optional: true
		}
	};
}
