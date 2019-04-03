import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('NAMES')
export default class Names extends Message<Names> {
	@MessageParamDefinition({
		type: 'channelList',
		optional: true
	})
	channel!: MessageParam;
	static readonly SUPPORTS_CAPTURE = true;
}
