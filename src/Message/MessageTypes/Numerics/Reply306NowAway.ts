import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply306NowAwayFields {
	me: string;
	suffix: string;
}

export interface Reply306NowAway extends Reply306NowAwayFields {}
export class Reply306NowAway extends Message<Reply306NowAwayFields> {
	static readonly COMMAND = '306';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
