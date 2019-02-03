import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply221UModeIsParams {
	me: MessageParam;
	modes: MessageParam;
}

export default class Reply221UModeIs extends Message<Reply221UModeIsParams> {
	static readonly COMMAND = '221';
	static readonly PARAM_SPEC: MessageParamSpec<Reply221UModeIs> = {
		me: {},
		modes: {}
	};
}
