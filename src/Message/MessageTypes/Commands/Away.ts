import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface AwayParams {
	message: MessageParam;
}

export default class Away extends Message<AwayParams> {
	static readonly COMMAND = 'AWAY';
	static readonly PARAM_SPEC: MessageParamSpec<Away> = {
		message: {
			trailing: true,
			optional: true
		}
	};
}
