import Message, { MessageParam, MessageParamSpec } from '../../Message';
import WhoQuery from '../Commands/WhoQuery';

export interface Reply315EndOfWhoParams {
	me: MessageParam;
	query: MessageParam;
	suffix: MessageParam;
}

export default class Reply315EndOfWho extends Message<Reply315EndOfWhoParams> {
	static readonly COMMAND = '315';
	static readonly PARAM_SPEC: MessageParamSpec<Reply315EndOfWho> = {
		me: {},
		query: {},
		suffix: {
			trailing: true
		}
	};

	protected isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}

	endsResponseTo(originalMessage: Message): boolean {
		return true;
	}
}
