import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface ChannelListFields {
	channel?: string;
	server?: string;
}

export interface ChannelList extends ChannelListFields {}
export class ChannelList extends Message<ChannelListFields> {
	static readonly COMMAND = 'LIST';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			channel: { optional: true },
			server: { optional: true }
		});
	}
}
