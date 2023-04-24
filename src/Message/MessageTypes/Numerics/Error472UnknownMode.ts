import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error472UnknownModeFields {
	me: string;
	char: string;
	suffix: string;
}

export interface Error472UnknownMode extends Error472UnknownModeFields {}
export class Error472UnknownMode extends Message<Error472UnknownModeFields> {
	static readonly COMMAND = '472';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			char: {},
			suffix: { trailing: true }
		});
	}
}
