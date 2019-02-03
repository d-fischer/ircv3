import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply004ServerInfoParams {
	me: MessageParam;
	serverName: MessageParam;
	version: MessageParam;
	userModes: MessageParam;
	channelModes: MessageParam;
	channelModesWithParam: MessageParam;
}

export default class Reply004ServerInfo extends Message<Reply004ServerInfoParams> {
	static readonly COMMAND = '004';
	static readonly PARAM_SPEC: MessageParamSpec<Reply004ServerInfo> = {
		me: {},
		serverName: {},
		version: {},
		userModes: {},
		channelModes: {},
		channelModesWithParam: {
			optional: true
		}
	};
}
