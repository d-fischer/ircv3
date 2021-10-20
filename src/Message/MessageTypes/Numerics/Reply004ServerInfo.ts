import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('004')
export class Reply004ServerInfo extends Message<Reply004ServerInfo> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	serverName!: MessageParam;

	@MessageParamDefinition()
	version!: MessageParam;

	@MessageParamDefinition()
	userModes!: MessageParam;

	@MessageParamDefinition()
	channelModes!: MessageParam;

	@MessageParamDefinition({
		optional: true
	})
	channelModesWithParam?: MessageParam;
}
