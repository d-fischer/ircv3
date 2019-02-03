import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error422NoMOTDParams {
	me: MessageParam;
	suffix: MessageParam;
}

export default class Error422NoMOTD extends Message<Error422NoMOTDParams> {
	static readonly COMMAND = '422';
	static readonly PARAM_SPEC: MessageParamSpec<Error422NoMOTD> = {
		me: {},
		suffix: {
			trailing: true
		}
	};
}
