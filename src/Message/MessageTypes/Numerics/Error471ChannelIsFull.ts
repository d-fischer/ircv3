import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error471ChannelIsFullFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error471ChannelIsFull extends Error471ChannelIsFullFields {}
export class Error471ChannelIsFull extends Message<Error471ChannelIsFullFields> {
	static readonly COMMAND = '471';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
