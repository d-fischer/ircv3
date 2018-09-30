import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply005ISupportParams {
	me: MessageParam;
	supports: MessageParam;
	suffix: MessageParam;
}

export default class Reply005ISupport extends Message<Reply005ISupportParams> {
	static readonly COMMAND = '005';
	static readonly PARAM_SPEC: MessageParamSpec<Reply005ISupport> = {
		me: {},
		supports: {
			rest: true
		},
		suffix: {
			trailing: true
		}
	};
}
