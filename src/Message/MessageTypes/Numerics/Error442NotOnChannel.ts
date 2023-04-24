import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error442NotOnChannelFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error442NotOnChannel extends Error442NotOnChannelFields {}
export class Error442NotOnChannel extends Message<Error442NotOnChannelFields> {
	static readonly COMMAND = '442';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
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
