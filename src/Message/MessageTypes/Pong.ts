import Message, {MessageParamSpec, MessagePrefix} from '../Message';

export default class Pong extends Message {
	public static readonly COMMAND = 'PONG';
	public readonly PARAM_SPEC: MessageParamSpec<Pong> = {
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
