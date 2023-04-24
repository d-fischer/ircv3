import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface KillFields {
	target: string;
	reason?: string;
}

export interface Kill extends KillFields {}
export class Kill extends Message<KillFields> {
	static readonly COMMAND = 'KILL';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			target: {},
			reason: { trailing: true, optional: true }
		});
	}
}
