import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ChannelListParams {
	channel: MessageParam;
	server: MessageParam;
}

export default class ChannelList extends Message<ChannelListParams> {
	static readonly COMMAND = 'LIST';
	static readonly PARAM_SPEC: MessageParamSpec<ChannelList> = {
		channel: {
			type: 'channel',
			optional: true
		},
		server: {
			optional: true
		}
	};
}
