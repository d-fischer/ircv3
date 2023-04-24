import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error474BannedFromChanFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error474BannedFromChan extends Error474BannedFromChanFields {}
export class Error474BannedFromChan extends Message<Error474BannedFromChanFields> {
	static readonly COMMAND = '474';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
