import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface NamesFields {
	channel?: string;
}

export interface Names extends NamesFields {}
export class Names extends Message<NamesFields> {
	static readonly COMMAND = 'NAMES';
	static readonly SUPPORTS_CAPTURE = true;
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			channel: { type: 'channelList', optional: true }
		});
	}
}
