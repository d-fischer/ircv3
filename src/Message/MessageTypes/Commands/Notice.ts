import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface NoticeFields {
	target: string;
	text: string;
}

export interface Notice extends NoticeFields {}
export class Notice extends Message<NoticeFields> {
	static readonly COMMAND = 'NOTICE';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			target: {},
			text: { trailing: true }
		});
	}
}
