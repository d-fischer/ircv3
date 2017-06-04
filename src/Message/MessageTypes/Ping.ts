import Message, {MessageParam, MessageParams, MessageParamSpec, MessagePrefix} from '../Message';

export interface PingParams extends MessageParams {
	message: MessageParam;
}

export default class Ping extends Message {
	public static readonly COMMAND = 'PING';
	public static readonly PARAM_SPEC: MessageParamSpec<PingParams> = {
		message: {
			optional: false,
			trailing: true
		}
	};

	public constructor(command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix) {
		super(command, params, tags, prefix);
		this.parseParams();
	}
}
