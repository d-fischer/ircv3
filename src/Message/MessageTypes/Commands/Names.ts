import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('NAMES')
export class Names extends Message<Names> {
	static readonly SUPPORTS_CAPTURE = true;

	@MessageParamDefinition({
		type: 'channelList',
		optional: true
	})
	channel!: MessageParam;
}
