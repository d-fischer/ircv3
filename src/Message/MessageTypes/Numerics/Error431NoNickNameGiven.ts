import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error431NoNickNameGivenFields {
	me: string;
	suffix: string;
}

export interface Error431NoNickNameGiven extends Error431NoNickNameGivenFields {}
export class Error431NoNickNameGiven extends Message<Error431NoNickNameGivenFields> {
	static readonly COMMAND = '431';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
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
