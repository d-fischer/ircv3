import Message, { MessageParam, MessageParamSpec } from '../../Message';
import Names from '../Commands/Names';

export interface Reply366EndOfNamesParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Reply366EndOfNames extends Message<Reply366EndOfNamesParams> {
	static readonly COMMAND = '366';
	static readonly PARAM_SPEC: MessageParamSpec<Reply366EndOfNames> = {
		me: {},
		channel: {
			type: 'channel'
		},
		suffix: {
			trailing: true
		}
	};

	protected isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}

	endsResponseTo(originalMessage: Message): boolean {
		return true;
	}
}
