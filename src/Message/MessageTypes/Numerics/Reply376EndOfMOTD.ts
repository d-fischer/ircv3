import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply376EndOfMOTDParams {
	me: MessageParam;
	suffix: MessageParam;
}

export default class Reply376EndOfMOTD extends Message<Reply376EndOfMOTDParams> {
	static readonly COMMAND = '376';
	static readonly PARAM_SPEC: MessageParamSpec<Reply376EndOfMOTD> = {
		me: {},
		suffix: {
			trailing: true
		}
	};
}
