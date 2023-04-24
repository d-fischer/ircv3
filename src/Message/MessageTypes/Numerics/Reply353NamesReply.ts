import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';
import { Names } from '../Commands/Names';

interface Reply353NamesReplyFields {
	me: string;
	channelType: string;
	channel: string;
	names: string;
}

export interface Reply353NamesReply extends Reply353NamesReplyFields {}
export class Reply353NamesReply extends Message<Reply353NamesReplyFields> {
	static readonly COMMAND = '353';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channelType: {},
			channel: { type: 'channel' },
			names: { trailing: true }
		});
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}
}
