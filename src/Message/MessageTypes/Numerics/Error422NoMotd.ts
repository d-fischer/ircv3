import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error422NoMotdFields {
	me: string;
	suffix: string;
}

export interface Error422NoMotd extends Error422NoMotdFields {}
export class Error422NoMotd extends Message<Error422NoMotdFields> {
	static readonly COMMAND = '422';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
