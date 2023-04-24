import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error401NoSuchNickFields {
	me: string;
	nick: string;
	suffix: string;
}

export interface Error401NoSuchNick extends Error401NoSuchNickFields {}
export class Error401NoSuchNick extends Message<Error401NoSuchNickFields> {
	static readonly COMMAND = '401';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			nick: {},
			suffix: { trailing: true }
		});
	}
}
