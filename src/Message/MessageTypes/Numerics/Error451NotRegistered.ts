import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error451NotRegisteredFields {
	me: string;
	suffix: string;
}

export interface Error451NotRegistered extends Error451NotRegisteredFields {}
export class Error451NotRegistered extends Message<Error451NotRegisteredFields> {
	static readonly COMMAND = '451';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
