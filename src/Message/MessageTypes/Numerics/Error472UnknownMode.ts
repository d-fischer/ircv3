import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('472')
export default class Error472UnknownMode extends Message<Error472UnknownMode> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	char!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
