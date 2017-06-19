import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Numeric004ServerInfoParams {
	me: MessageParam;
	serverName: MessageParam;
	version: MessageParam;
	userModes: MessageParam;
	channelModes: MessageParam;
	channelModesWithParam: MessageParam;
}

export default class Numeric004ServerInfo extends Message<Numeric004ServerInfoParams> {
	public static readonly COMMAND = '004';
	public static readonly PARAM_SPEC: MessageParamSpec<Numeric004ServerInfoParams> = {
		me: {},
		serverName: {},
		version: {
			optional: true
		},
		userModes: {
			optional: true
		},
		channelModes: {
			optional: true
		},
		channelModesWithParam: {
			optional: true
		},
	};
}
