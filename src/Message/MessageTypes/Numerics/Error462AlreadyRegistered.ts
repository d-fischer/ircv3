import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error462AlreadyRegisteredFields {
	me: string;
	suffix: string;
}

export interface Error462AlreadyRegistered extends Error462AlreadyRegisteredFields {}
export class Error462AlreadyRegistered extends Message<Error462AlreadyRegisteredFields> {
	static readonly COMMAND = '462';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
