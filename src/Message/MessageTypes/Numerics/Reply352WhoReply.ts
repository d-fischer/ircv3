import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';
import { WhoQuery } from '../Commands/WhoQuery';

interface Reply352WhoReplyFields {
	me: string;
	channel: string;
	user: string;
	host: string;
	server: string;
	nick: string;
	flags: string;
	hopsAndRealName: string;
}

export interface Reply352WhoReply extends Reply352WhoReplyFields {}
export class Reply352WhoReply extends Message<Reply352WhoReplyFields> {
	static readonly COMMAND = '352';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: {},
			user: {},
			host: {},
			server: {},
			nick: {},
			flags: {},
			hopsAndRealName: { trailing: true }
		});
	}

	/**
	 * Checks whether the found user is /away.
	 */
	get isAway(): boolean {
		return this.flags.includes('G');
	}

	/**
	 * Checks whether the found user is an IRCOp.
	 */
	get isOper(): boolean {
		return this.flags.includes('*');
	}

	/**
	 * Checks whether the found user is a bot.
	 */
	get isBot(): boolean {
		return this.flags.includes('B');
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}
}
