import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error436NickCollisionFields {
	me: string;
	nick: string;
	suffix: string;
}

export interface Error436NickCollision extends Error436NickCollisionFields {}
export class Error436NickCollision extends Message<Error436NickCollisionFields> {
	static readonly COMMAND = '436';
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
