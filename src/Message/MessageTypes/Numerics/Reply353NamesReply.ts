import Message, { MessageParam, MessageParamSpec } from '../../Message';
import Names from '../Commands/Names';

export interface Reply353NamesReplyParams {
	me: MessageParam;
	channelType: MessageParam;
	channel: MessageParam;
	names: MessageParam;
}

export default class Reply353NamesReply extends Message<Reply353NamesReplyParams> {
	static readonly COMMAND = '353';
	static readonly PARAM_SPEC: MessageParamSpec<Reply353NamesReply> = {
		me: {},
		channelType: {},
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
