import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface ChannelPartParams {
	channel: MessageParam;
}

export default class ChannelPart extends Message<ChannelPartParams> {
	public static readonly COMMAND = 'PART';
	public static readonly PARAM_SPEC: MessageParamSpec<ChannelPartParams> = {
		channel: {
			type: 'channel'
		}
	};
}
