import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error501UModeUnknownFlagParams {
	me: MessageParam;
	suffix: MessageParam;
}

export default class Error501UModeUnknownFlag extends Message<Error501UModeUnknownFlagParams> {
	static readonly COMMAND = '501';
	static readonly PARAM_SPEC: MessageParamSpec<Error501UModeUnknownFlag> = {
		me: {},
		suffix: {
			trailing: true
		}
	};
}
