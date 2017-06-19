import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Numeric353NamesReplyParams {
	me: MessageParam;
	sentinel: MessageParam;
	channel: MessageParam;
	names: MessageParam;
}

export default class Numeric353NamesReply extends Message<Numeric353NamesReplyParams> {
	public static readonly COMMAND = '353';
	public static readonly PARAM_SPEC: MessageParamSpec<Numeric353NamesReplyParams> = {
		me: {},
		sentinel: {},
		channel: {
			type: 'channel'
		},
		names: {
			trailing: true
		}
	};
}
