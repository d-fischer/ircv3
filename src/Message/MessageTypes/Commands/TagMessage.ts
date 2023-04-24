import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface TagMessageFields {
	target: string;
}

export interface TagMessage extends TagMessageFields {}
export class TagMessage extends Message<TagMessageFields> {
	static readonly COMMAND = 'TAGMSG';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			target: {}
		});
	}
}
