import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error433NickNameInUseFields {
	me: string;
	nick: string;
	suffix: string;
}

export interface Error433NickNameInUse extends Error433NickNameInUseFields {}
export class Error433NickNameInUse extends Message<Error433NickNameInUseFields> {
	static readonly COMMAND = '433';
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
