import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('QUIT')
export default class ClientQuit extends Message<ClientQuit> {
	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	message!: MessageParam;
}
