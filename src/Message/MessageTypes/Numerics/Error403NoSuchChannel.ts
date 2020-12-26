import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('403')
export class Error403NoSuchChannel extends Message<Error403NoSuchChannel> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		// channel type is wrong here - this numeric is also used for showing the user this is *not* a valid channel name
		// type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
