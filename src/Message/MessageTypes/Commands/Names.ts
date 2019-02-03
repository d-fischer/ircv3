import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface NamesParams {
	channel: MessageParam;
}

export default class Names extends Message<NamesParams> {
	static readonly COMMAND = 'NAMES';
	static readonly PARAM_SPEC: MessageParamSpec<Names> = {
		channel: {
			type: 'channelList',
			optional: true
		}
	};
	static readonly SUPPORTS_CAPTURE = true;
}
