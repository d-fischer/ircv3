import Message, { MessageParam, MessageParamSpec } from '../../Message';
import { Names } from '../Commands';

export interface Reply353NamesReplyParams {
	me: MessageParam;
	sentinel: MessageParam;
	channel: MessageParam;
	names: MessageParam;
}

export default class Reply353NamesReply extends Message<Reply353NamesReplyParams> {
	public static readonly COMMAND = '353';
	public static readonly PARAM_SPEC: MessageParamSpec<Reply353NamesReplyParams> = {
		me: {},
		sentinel: {},
		channel: {
			type: 'channel'
		},
		names: {
			trailing: true
		}
	};

	protected isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}
}
