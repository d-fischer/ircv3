import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';
import { WhoQuery } from '../Commands/WhoQuery';

interface Reply315EndOfWhoFields {
	me: string;
	query: string;
	suffix: string;
}

export interface Reply315EndOfWho extends Reply315EndOfWhoFields {}
export class Reply315EndOfWho extends Message<Reply315EndOfWhoFields> {
	static readonly COMMAND = '315';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			query: {},
			suffix: { trailing: true }
		});
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}

	endsResponseTo(): boolean {
		return true;
	}
}
