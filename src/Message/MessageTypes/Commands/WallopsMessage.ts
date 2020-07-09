import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('WALLOPS')
export class WallopsMessage extends Message<WallopsMessage> {
	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
