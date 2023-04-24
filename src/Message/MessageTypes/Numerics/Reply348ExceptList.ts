import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply348ExceptListFields {
	me: string;
	channel: string;
	mask: string;
	creatorName?: string;
	timestamp?: string;
}

export interface Reply348ExceptList extends Reply348ExceptListFields {}
export class Reply348ExceptList extends Message<Reply348ExceptListFields> {
	static readonly COMMAND = '348';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			mask: {},
			creatorName: { optional: true },
			timestamp: { optional: true }
		});
	}
}
