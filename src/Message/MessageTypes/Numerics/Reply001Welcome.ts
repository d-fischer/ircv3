import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('001')
export class Reply001Welcome extends Message<Reply001Welcome> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	welcomeText!: MessageParam;
}
