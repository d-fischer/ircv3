import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface TimeFields {
	server?: string;
}

export interface Time extends TimeFields {}
export class Time extends Message<TimeFields> {
	static readonly COMMAND = 'TIME';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			server: { optional: true }
		});
	}
}
