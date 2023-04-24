import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error473InviteOnlyChanFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error473InviteOnlyChan extends Error473InviteOnlyChanFields {}
export class Error473InviteOnlyChan extends Message<Error473InviteOnlyChanFields> {
	static readonly COMMAND = '473';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
