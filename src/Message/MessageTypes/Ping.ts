import Message, {MessageParam, MessageParamSpec} from '../Message';

export interface PingParams {
	message: MessageParam;
}

export default class Ping extends Message<PingParams> {
	public static readonly COMMAND = 'PING';
	public static readonly PARAM_SPEC: MessageParamSpec<PingParams> = {
		message: {
			optional: false,
			trailing: true
		}
	};
}
