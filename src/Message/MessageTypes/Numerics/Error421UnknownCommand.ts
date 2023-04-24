import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error421UnknownCommandFields {
	me: string;
	originalCommand: string;
	suffix: string;
}

export interface Error421UnknownCommand extends Error421UnknownCommandFields {}
export class Error421UnknownCommand extends Message<Error421UnknownCommandFields> {
	static readonly COMMAND = '421';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			originalCommand: {},
			suffix: { trailing: true }
		});
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage.command === this.originalCommand;
	}

	endsResponseTo(): boolean {
		return true;
	}
}
