import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('311')
export class Reply311WhoisUser extends Message<Reply311WhoisUser> {
	@MessageParamDefinition()
	me!: MessageParam;

	@MessageParamDefinition()
	nick!: MessageParam;

	@MessageParamDefinition()
	username!: MessageParam;

	@MessageParamDefinition()
	host!: MessageParam;

	@MessageParamDefinition()
	_unused!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	realname!: MessageParam;
}
