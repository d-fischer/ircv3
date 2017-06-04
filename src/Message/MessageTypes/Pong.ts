import Message, {MessageParam, MessageParamSpec, MessagePrefix} from '../Message';

export interface PongParams {
	message: MessageParam;
}

export default class Pong extends Message<PongParams> {
	public static readonly COMMAND = 'PONG';
	public static readonly PARAM_SPEC: MessageParamSpec<PongParams> = {
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
