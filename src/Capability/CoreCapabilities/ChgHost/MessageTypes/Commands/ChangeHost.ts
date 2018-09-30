import Message, { MessageParam, MessageParamSpec } from '../../../../../Message/Message';

export interface ChgHostParams {
	newUser: MessageParam;
	newHost: MessageParam;
}

export default class ChgHost extends Message<ChgHostParams> {
	public static readonly COMMAND = 'CHGHOST';
	public static readonly PARAM_SPEC: MessageParamSpec<ChgHost> = {
		newUser: {},
		newHost: {}
	};
}
