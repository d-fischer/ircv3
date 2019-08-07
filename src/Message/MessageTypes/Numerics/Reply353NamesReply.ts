import Message, { MessageParam } from '../../Message';
import Names from '../Commands/Names';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('353')
export default class Reply353NamesReply extends Message<Reply353NamesReply> {
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
