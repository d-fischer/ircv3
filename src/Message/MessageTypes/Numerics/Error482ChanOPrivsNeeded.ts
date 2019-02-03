import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error482ChanOPrivsNeededParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error482ChanOPrivsNeeded extends Message<Error482ChanOPrivsNeededParams> {
	static readonly COMMAND = '482';
	static readonly PARAM_SPEC: MessageParamSpec<Error482ChanOPrivsNeeded> = {
		me: {},
		channel: {},
		suffix: {
			trailing: true
		}
	};
}
