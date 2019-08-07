import Message, { MessageParam } from '../../Message';
import WhoQuery from '../Commands/WhoQuery';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('315')
export default class Reply315EndOfWho extends Message<Reply315EndOfWho> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	query!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	suffix!: MessageParam;

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof WhoQuery;
	}

	endsResponseTo(originalMessage: Message): boolean {
		return true;
	}
}
