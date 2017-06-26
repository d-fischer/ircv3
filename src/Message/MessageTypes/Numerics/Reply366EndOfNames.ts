import Message, {MessageParam, MessageParamSpec} from '../../Message';
import {Names} from '../Commands';

export interface Reply366EndOfNamesParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Reply366EndOfNames extends Message<Reply366EndOfNamesParams> {
	public static readonly COMMAND = '366';
	public static readonly PARAM_SPEC: MessageParamSpec<Reply366EndOfNamesParams> = {
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

	public endsResponseTo(originalMessage: Message): boolean {
		return true;
	}
}
