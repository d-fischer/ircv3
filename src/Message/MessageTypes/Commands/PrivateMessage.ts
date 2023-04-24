import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface PrivateMessageFields {
	target: string;
	text: string;
}

export interface PrivateMessage extends PrivateMessageFields {}
export class PrivateMessage extends Message<PrivateMessageFields> {
	static readonly COMMAND = 'PRIVMSG';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			target: {},
			text: { trailing: true }
		});
	}
}
