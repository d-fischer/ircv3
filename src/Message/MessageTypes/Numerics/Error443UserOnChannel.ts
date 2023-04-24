import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error443UserOnChannelFields {
	me: string;
	nick: string;
	channel: string;
	suffix: string;
}

export interface Error443UserOnChannel extends Error443UserOnChannelFields {}
export class Error443UserOnChannel extends Message<Error443UserOnChannelFields> {
	static readonly COMMAND = '443';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			nick: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage.command === 'NICK';
	}

	endsResponseTo(): boolean {
		return true;
	}
}
