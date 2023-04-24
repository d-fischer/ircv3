import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error405TooManyChannelsFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error405TooManyChannels extends Error405TooManyChannelsFields {}
export class Error405TooManyChannels extends Message<Error405TooManyChannelsFields> {
	static readonly COMMAND = '405';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
