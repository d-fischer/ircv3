import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';
import { Names } from '../Commands/Names';

interface Reply366EndOfNamesFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Reply366EndOfNames extends Reply366EndOfNamesFields {}
export class Reply366EndOfNames extends Message<Reply366EndOfNamesFields> {
	static readonly COMMAND = '366';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: {},
			suffix: { trailing: true }
		});
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}

	endsResponseTo(): boolean {
		return true;
	}
}
