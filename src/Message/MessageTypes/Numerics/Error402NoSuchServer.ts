import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('402')
export class Error402NoSuchServer extends Message<Error402NoSuchServer> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	server!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
