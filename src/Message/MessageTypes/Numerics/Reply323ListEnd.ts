import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply323ListEndFields {
	me: string;
	suffix: string;
}

export interface Reply323ListEnd extends Reply323ListEndFields {}
export class Reply323ListEnd extends Message<Reply323ListEndFields> {
	static readonly COMMAND = '323';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
