import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface NickChangeParams {
	nick: MessageParam;
}

export default class NickChange extends Message<NickChangeParams> {
	static readonly COMMAND = 'NICK';
	static readonly PARAM_SPEC: MessageParamSpec<NickChange> = {
		nick: {}
	};
}
