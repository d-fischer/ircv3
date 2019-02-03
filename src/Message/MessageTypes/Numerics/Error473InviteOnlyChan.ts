import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error473InviteOnlyChanParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error473InviteOnlyChan extends Message<Error473InviteOnlyChanParams> {
	static readonly COMMAND = '473';
	static readonly PARAM_SPEC: MessageParamSpec<Error473InviteOnlyChan> = {
		me: {},
		channel: {},
		suffix: {
			trailing: true
		}
	};
}
