import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface KillParams {
	target: MessageParam;
	comment: MessageParam;
}

export default class Kill extends Message<KillParams> {
	static readonly COMMAND = 'KILL';
	static readonly PARAM_SPEC: MessageParamSpec<Kill> = {
		target: {},
		comment: {
			trailing: true,
			optional: true
		}
	};
}
