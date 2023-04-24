import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply349EndOfExceptListFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Reply349EndOfExceptList extends Reply349EndOfExceptListFields {}
export class Reply349EndOfExceptList extends Message<Reply349EndOfExceptListFields> {
	static readonly COMMAND = '349';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
