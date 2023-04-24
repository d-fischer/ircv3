import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply332TopicFields {
	me: string;
	channel: string;
	topic: string;
}

export interface Reply332Topic extends Reply332TopicFields {}
export class Reply332Topic extends Message<Reply332TopicFields> {
	static readonly COMMAND = '332';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			topic: { trailing: true }
		});
	}
}
