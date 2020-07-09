import { Message, MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';
import { Names } from '../Commands/Names';

@MessageType('353')
export class Reply353NamesReply extends Message<Reply353NamesReply> {
	@MessageParamDefinition({})
	me!: MessageParam;

	@MessageParamDefinition({})
	channelType!: MessageParam;

	@MessageParamDefinition({
		type: 'channel'
	})
	channel!: MessageParam;

	@MessageParamDefinition({
		trailing: true
	})
	names!: MessageParam;

	isResponseTo(originalMessage: Message): boolean {
		return originalMessage instanceof Names;
	}
}
