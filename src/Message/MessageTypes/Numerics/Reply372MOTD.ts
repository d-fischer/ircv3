import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply372MOTDParams {
	me: MessageParam;
	line: MessageParam;
}

export default class Reply372MOTD extends Message<Reply372MOTDParams> {
	static readonly COMMAND = '372';
	static readonly PARAM_SPEC: MessageParamSpec<Reply372MOTD> = {
		me: {},
		line: {
			trailing: true
		}
	};
}
