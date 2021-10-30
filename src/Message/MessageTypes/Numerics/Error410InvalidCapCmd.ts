import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('410')
export class Error410InvalidCapCmd extends Message<Error410InvalidCapCmd> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	subCommand!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
