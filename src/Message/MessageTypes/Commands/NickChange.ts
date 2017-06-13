import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface NickChangeParams {
	nick: MessageParam;
}

export default class NickChange extends Message<NickChangeParams> {
	public static readonly COMMAND = 'NICK';
	public static readonly PARAM_SPEC: MessageParamSpec<NickChangeParams> = {
		nick: {}
	};
}
