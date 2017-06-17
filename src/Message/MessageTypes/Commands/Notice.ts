import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface NoticeParams {
	target: MessageParam;
	message: MessageParam;
}

export default class Notice extends Message<NoticeParams> {
	public static readonly COMMAND = 'NOTICE';
	public static readonly PARAM_SPEC: MessageParamSpec<NoticeParams> = {
		target: {},
		message: {
			trailing: true
		}
	};
}
