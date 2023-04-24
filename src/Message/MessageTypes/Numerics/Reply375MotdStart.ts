import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply375MotdStartFields {
	me: string;
	line: string;
}

export interface Reply375MotdStart extends Reply375MotdStartFields {}
export class Reply375MotdStart extends Message<Reply375MotdStartFields> {
	static readonly COMMAND = '375';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			line: { trailing: true }
		});
	}
}
