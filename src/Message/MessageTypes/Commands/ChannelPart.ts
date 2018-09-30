import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ChannelPartParams {
	channel: MessageParam;
}

export default class ChannelPart extends Message<ChannelPartParams> {
	static readonly COMMAND = 'PART';
	static readonly PARAM_SPEC: MessageParamSpec<ChannelPart> = {
		channel: {
			type: 'channel'
		}
	};
}
