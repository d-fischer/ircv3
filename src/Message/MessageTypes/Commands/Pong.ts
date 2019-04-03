import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('PONG')
export default class Pong extends Message<Pong> {
	@MessageParamDefinition({
		noClient: true
	})
	server!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
