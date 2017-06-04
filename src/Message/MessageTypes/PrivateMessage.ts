import Message, {MessageParam, MessageParamSpec, MessagePrefix} from '../Message';

export interface PrivateMessageParams {
	target: MessageParam;
	message: MessageParam;
}

export default class PrivateMessage extends Message<PrivateMessageParams> {
	public static readonly COMMAND = 'PRIVMSG';
	public static readonly PARAM_SPEC: MessageParamSpec<PrivateMessageParams> = {
		target: {
			optional: false,
			trailing: false
		},
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
