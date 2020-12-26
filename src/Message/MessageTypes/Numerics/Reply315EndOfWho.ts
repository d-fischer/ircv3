import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';
import { WhoQuery } from '../Commands/WhoQuery';

@MessageType('315')
export class Reply315EndOfWho extends Message<Reply315EndOfWho> {
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

	endsResponseTo(): boolean {
		return true;
	}
}
