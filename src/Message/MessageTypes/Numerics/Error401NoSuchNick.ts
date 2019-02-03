import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error401NoSuchNickParams {
	me: MessageParam;
	nick: MessageParam;
	suffix: MessageParam;
}

export default class Error401NoSuchNick extends Message<Error401NoSuchNickParams> {
	static readonly COMMAND = '401';
	static readonly PARAM_SPEC: MessageParamSpec<Error401NoSuchNick> = {
		me: {},
		nick: {},
		suffix: {
			trailing: true
		}
	};
}
