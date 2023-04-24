import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error502UsersDontMatchFields {
	me: string;
	suffix: string;
}

export interface Error502UsersDontMatch extends Error502UsersDontMatchFields {}
export class Error502UsersDontMatch extends Message<Error502UsersDontMatchFields> {
	static readonly COMMAND = '502';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
