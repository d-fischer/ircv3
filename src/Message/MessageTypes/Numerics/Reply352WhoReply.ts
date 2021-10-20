import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';
import { WhoQuery } from '../Commands/WhoQuery';

@MessageType('352')
export class Reply352WhoReply extends Message<Reply352WhoReply> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	channel!: MessageParam;

	@MessageParamDefinition()
	host!: MessageParam;

	@MessageParamDefinition()
	server!: MessageParam;

	@MessageParamDefinition()
	nick!: MessageParam;

	@MessageParamDefinition()
	flags!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	hopsAndRealName!: MessageParam;

	/**
	 * Checks whether the found user is /away.
	 */
	get isAway(): boolean {
		return this.params.flags.includes('G');
	}

	/**
	 * Checks whether the found user is an IRCOp.
	 */
	get isOper(): boolean {
		return this.params.flags.includes('*');
	}

	/**
	 * Checks whether the found user is a bot.
	 */
	get isBot(): boolean {
		return this.params.flags.includes('B');
	}

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}
}
