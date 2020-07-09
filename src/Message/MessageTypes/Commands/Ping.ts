import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PING')
export class Ping extends Message<Ping> {
	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
