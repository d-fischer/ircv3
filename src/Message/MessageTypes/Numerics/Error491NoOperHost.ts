import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error491NoOperHostFields {
	me: string;
	suffix: string;
}

export interface Error491NoOperHost extends Error491NoOperHostFields {}
export class Error491NoOperHost extends Message<Error491NoOperHostFields> {
	static readonly COMMAND = '491';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
