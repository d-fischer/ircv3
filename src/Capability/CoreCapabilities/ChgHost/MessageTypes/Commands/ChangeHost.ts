import Message, { MessageParam, MessageParamSpec } from '../../../../../Message/Message';

export interface ChgHostParams {
	newUser: MessageParam;
	newHost: MessageParam;
}

export default class ChgHost extends Message<ChgHostParams> {
	static readonly COMMAND = 'CHGHOST';
	static readonly PARAM_SPEC: MessageParamSpec<ChgHost> = {
		newUser: {},
		newHost: {}
	};
}
