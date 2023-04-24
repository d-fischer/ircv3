import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply305UnAwayFields {
	me: string;
	suffix: string;
}

export interface Reply305UnAway extends Reply305UnAwayFields {}
export class Reply305UnAway extends Message<Reply305UnAwayFields> {
	static readonly COMMAND = '305';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
