import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply318EndOfWhoisFields {
	me: string;
	nickMask: string;
	suffix: string;
}

export interface Reply318EndOfWhois extends Reply318EndOfWhoisFields {}
export class Reply318EndOfWhois extends Message<Reply318EndOfWhoisFields> {
	static readonly COMMAND = '318';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			nickMask: {},
			suffix: { trailing: true }
		});
	}
}
