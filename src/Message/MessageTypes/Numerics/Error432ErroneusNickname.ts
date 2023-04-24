import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error432ErroneusNicknameFields {
	me: string;
	nick: string;
	suffix: string;
}

// misspelt for historical reasons
export interface Error432ErroneusNickname extends Error432ErroneusNicknameFields {}
export class Error432ErroneusNickname extends Message<Error432ErroneusNicknameFields> {
	static readonly COMMAND = '432';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			nick: {},
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
