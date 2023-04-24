import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply322ListFields {
	me: string;
	channel: string;
	memberCount: string;
	topic: string;
}

export interface Reply322List extends Reply322ListFields {}
export class Reply322List extends Message<Reply322ListFields> {
	static readonly COMMAND = '322';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			memberCount: {},
			topic: { trailing: true }
		});
	}
}
