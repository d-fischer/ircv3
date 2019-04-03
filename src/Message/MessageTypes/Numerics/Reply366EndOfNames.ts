import Message, { MessageParam } from '../../Message';
import Names from '../Commands/Names';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('366')
export default class Reply366EndOfNames extends Message<Reply366EndOfNames> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	protected isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}

	endsResponseTo(originalMessage: Message): boolean {
		return true;
	}
}
