import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply381YoureOperFields {
	me: string;
	suffix: string;
}

export interface Reply381YoureOper extends Reply381YoureOperFields {}
export class Reply381YoureOper extends Message<Reply381YoureOperFields> {
	static readonly COMMAND = '381';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
