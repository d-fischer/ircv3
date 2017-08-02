import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface AwayParams {
	message: MessageParam;
}

export default class Away extends Message<AwayParams> {
	public static readonly COMMAND = 'AWAY';
	public static readonly PARAM_SPEC: MessageParamSpec<AwayParams> = {
		message: {
			trailing: true,
			optional: true
		}
	};
}
