import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Numeric421UnknownCommandParams {
	me: MessageParam;
	command: MessageParam;
	suffix: MessageParam;
}

export default class Numeric421UnknownCommand extends Message<Numeric421UnknownCommandParams> {
	public static readonly COMMAND = '421';
	public static readonly PARAM_SPEC: MessageParamSpec<Numeric421UnknownCommandParams> = {
		me: {},
		command: {},
		suffix: {
			trailing: true
		}
	};
}
