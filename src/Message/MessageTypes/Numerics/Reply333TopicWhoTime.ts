import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply333TopicWhoTimeFields {
	me: string;
	channel: string;
	who: string;
	ts: string;
}

export interface Reply333TopicWhoTime extends Reply333TopicWhoTimeFields {}
export class Reply333TopicWhoTime extends Message<Reply333TopicWhoTimeFields> {
	static readonly COMMAND = '333';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			who: {},
			ts: {}
		});
	}
}
