import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply003CreatedFields {
	me: string;
	createdText: string;
}

export interface Reply003Created extends Reply003CreatedFields {}
export class Reply003Created extends Message<Reply003CreatedFields> {
	static readonly COMMAND = '003';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			createdText: { trailing: true }
		});
	}
}
