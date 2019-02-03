import Message, { MessageParam, MessageParamSpec } from '../../Message';
import WhoQuery from '../Commands/WhoQuery';

export interface Reply352WhoReplyParams {
	me: MessageParam;
	channel: MessageParam;
	host: MessageParam;
	server: MessageParam;
	nick: MessageParam;
	flags: MessageParam;
	hopsAndRealName: MessageParam;
}

export default class Reply352WhoReply extends Message<Reply352WhoReplyParams> {
	static readonly COMMAND = '352';
	static readonly PARAM_SPEC: MessageParamSpec<Reply352WhoReply> = {
		me: {},
		channel: {},
		host: {},
		server: {},
		nick: {},
		flags: {},
		hopsAndRealName: {
			trailing: true
		}
	};

	/**
	 * Checks whether the found user is /away.
	 */
	get isAway() {
		return this._parsedParams.flags.value.includes('G');
	}

	/**
	 * Checks whether the found user is an IRCOp.
	 */
	get isOper() {
		return this._parsedParams.flags.value.includes('*');
	}

	/**
	 * Checks whether the found user is a bot.
	 */
	get isBot() {
		return this._parsedParams.flags.value.includes('B');
	}

	protected isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}
}
