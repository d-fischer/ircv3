import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('SQUIT')
export default class ServerQuit extends Message<ServerQuit> {
	@MessageParamDefinition({})
	server!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	message!: MessageParam;
}
