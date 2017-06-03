import Message, {MessageParamSpec, MessagePrefix} from '../Message';

export default class Ping extends Message {
	public static readonly COMMAND = 'PING';
	public readonly PARAM_SPEC: MessageParamSpec<Ping> = {
		message: {
			trailing: true
		}
	};

	public message: string;

	public constructor(command: string, params?: string[], tags?: Map<string, string>, prefix?: MessagePrefix) {
		super(command, params, tags, prefix);
		this.parseParams();
	}
}
