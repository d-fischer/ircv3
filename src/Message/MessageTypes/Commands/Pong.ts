import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PONG')
export class Pong extends Message<Pong> {
	@MessageParamDefinition({
		noClient: true
	})
	server!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
