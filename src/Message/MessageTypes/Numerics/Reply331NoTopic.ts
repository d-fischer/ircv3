import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply331NoTopicFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Reply331NoTopic extends Reply331NoTopicFields {}
export class Reply331NoTopic extends Message<Reply331NoTopicFields> {
	static readonly COMMAND = '331';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
