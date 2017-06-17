import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface NamesParams {
	channel: MessageParam;
}

export default class Names extends Message<NamesParams> {
	public static readonly COMMAND = 'NAMES';
	public static readonly PARAM_SPEC: MessageParamSpec<NamesParams> = {
		channel: {
			type: 'channel',
			optional: true
		}
	};
}
