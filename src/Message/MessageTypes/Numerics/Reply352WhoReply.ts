import Message, { MessageParam } from '../../Message';
import WhoQuery from '../Commands/WhoQuery';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('352')
export default class Reply352WhoReply extends Message<Reply352WhoReply> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	channel!: MessageParam;

	@MessageParamDefinition({})
	host!: MessageParam;

	@MessageParamDefinition({})
	server!: MessageParam;

	@MessageParamDefinition({})
	nick!: MessageParam;

	@MessageParamDefinition({})
	flags!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	hopsAndRealName!: MessageParam;

	/**
	 * Checks whether the found user is /away.
	 */
	get isAway() {
		return this.params.flags.includes('G');
	}

	/**
	 * Checks whether the found user is an IRCOp.
	 */
	get isOper() {
		return this.params.flags.includes('*');
	}

	/**
	 * Checks whether the found user is a bot.
	 */
	get isBot() {
		return this.params.flags.includes('B');
	}

	protected isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}
}
