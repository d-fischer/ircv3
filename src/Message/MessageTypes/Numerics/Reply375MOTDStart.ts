import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply375MOTDStartParams {
	me: MessageParam;
	message: MessageParam;
}

export default class Reply375MOTDStart extends Message<Reply375MOTDStartParams> {
	static readonly COMMAND = '375';
	static readonly PARAM_SPEC: MessageParamSpec<Reply375MOTDStart> = {
		me: {},
		message: {
			trailing: true
		}
	};
}
