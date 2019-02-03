import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error502UsersDontMatchUnknownModeParams {
	me: MessageParam;
	suffix: MessageParam;
}

export default class Error502UsersDontMatchUnknownMode extends Message<Error502UsersDontMatchUnknownModeParams> {
	static readonly COMMAND = '502';
	static readonly PARAM_SPEC: MessageParamSpec<Error502UsersDontMatchUnknownMode> = {
		me: {},
		suffix: {
			trailing: true
		}
	};
}
