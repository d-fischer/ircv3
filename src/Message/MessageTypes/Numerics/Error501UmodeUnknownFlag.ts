import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('501')
export class Error501UmodeUnknownFlag extends Message<Error501UmodeUnknownFlag> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;
}
