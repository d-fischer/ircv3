import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface KillParams {
	target: MessageParam;
	comment: MessageParam;
}

export default class Kill extends Message<KillParams> {
	public static readonly COMMAND = 'KILL';
	public static readonly PARAM_SPEC: MessageParamSpec<KillParams> = {
		target: {},
		comment: {
			trailing: true,
			optional: true
		}
	};
}
