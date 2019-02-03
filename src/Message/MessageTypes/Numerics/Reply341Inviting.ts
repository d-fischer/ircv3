import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply341InvitingParams {
	me: MessageParam;
	nick: MessageParam;
	channel: MessageParam;
}

export default class Reply341Inviting extends Message<Reply341InvitingParams> {
	static readonly COMMAND = '341';
	static readonly PARAM_SPEC: MessageParamSpec<Reply341Inviting> = {
		me: {},
		nick: {},
		channel: {
			type: 'channel'
		}
	};
}
