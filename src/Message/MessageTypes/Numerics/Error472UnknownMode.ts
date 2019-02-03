import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error472UnknownModeParams {
	me: MessageParam;
	char: MessageParam;
	suffix: MessageParam;
}

export default class Error472UnknownMode extends Message<Error472UnknownModeParams> {
	static readonly COMMAND = '472';
	static readonly PARAM_SPEC: MessageParamSpec<Error472UnknownMode> = {
		me: {},
		char: {},
		suffix: {
			trailing: true
		}
	};
}
