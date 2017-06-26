import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Reply005ISupportParams {
	me: MessageParam;
	supports: MessageParam;
	suffix: MessageParam;
}

export default class Reply005ISupport extends Message<Reply005ISupportParams> {
	public static readonly COMMAND = '005';
	public static readonly PARAM_SPEC: MessageParamSpec<Reply005ISupportParams> = {
		me: {},
		supports: {
			rest: true
		},
		suffix: {
			trailing: true
		}
	};
}
