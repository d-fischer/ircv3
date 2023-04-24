import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error402NoSuchServerFields {
	me: string;
	server: string;
	suffix: string;
}

export interface Error402NoSuchServer extends Error402NoSuchServerFields {}
export class Error402NoSuchServer extends Message<Error402NoSuchServerFields> {
	static readonly COMMAND = '402';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			server: {},
			suffix: { trailing: true }
		});
	}
}
