import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error482ChanOpPrivsNeededFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error482ChanOpPrivsNeeded extends Error482ChanOpPrivsNeededFields {}
export class Error482ChanOpPrivsNeeded extends Message<Error482ChanOpPrivsNeededFields> {
	static readonly COMMAND = '482';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: {},
			suffix: { trailing: true }
		});
	}
}
