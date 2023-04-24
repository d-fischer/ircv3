import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply368EndOfBanListFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Reply368EndOfBanList extends Reply368EndOfBanListFields {}
export class Reply368EndOfBanList extends Message<Reply368EndOfBanListFields> {
	static readonly COMMAND = '368';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
