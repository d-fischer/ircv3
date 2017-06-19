import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Numeric366EndOfNamesParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Numeric366EndOfNames extends Message<Numeric366EndOfNamesParams> {
	public static readonly COMMAND = '366';
	public static readonly PARAM_SPEC: MessageParamSpec<Numeric366EndOfNamesParams> = {
		me: {},
		channel: {
			type: 'channel'
		},
		suffix: {
			trailing: true
		}
	};
}
