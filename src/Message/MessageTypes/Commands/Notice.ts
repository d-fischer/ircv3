import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface NoticeParams {
	target: MessageParam;
	message: MessageParam;
}

export default class Notice extends Message<NoticeParams> {
	static readonly COMMAND = 'NOTICE';
	static readonly PARAM_SPEC: MessageParamSpec<Notice> = {
		target: {},
		message: {
			trailing: true
		}
	};
}
