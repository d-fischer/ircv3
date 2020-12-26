import type { MessageParam } from '../../Message';
import { Message } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';
import { Names } from '../Commands/Names';

@MessageType('366')
export class Reply366EndOfNames extends Message<Reply366EndOfNames> {
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

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}

	endsResponseTo(): boolean {
		return true;
	}
}
