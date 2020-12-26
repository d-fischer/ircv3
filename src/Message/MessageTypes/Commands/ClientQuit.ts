import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('QUIT')
export class ClientQuit extends Message<ClientQuit> {
	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	message!: MessageParam;
}
