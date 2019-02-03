import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply002YourHostParams {
	me: MessageParam;
	yourHost: MessageParam;
}

export default class Reply002YourHost extends Message<Reply002YourHostParams> {
	static readonly COMMAND = '002';
	static readonly PARAM_SPEC: MessageParamSpec<Reply002YourHost> = {
		me: {},
		yourHost: {
			trailing: true
		}
	};
}
