import Message, {MessageParamSpec, MessagePrefix} from '../Message';

export default class PrivateMessage extends Message {
	public static readonly COMMAND = 'PRIVMSG';
	public readonly PARAM_SPEC: MessageParamSpec<PrivateMessage> = {
		target: true,
		message: {
			trailing: true
		}
	};

	public target: string;
	public message: string;

	public constructor(command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix) {
		super(command, params, tags, prefix);
		this.parseParams();
	}
}
