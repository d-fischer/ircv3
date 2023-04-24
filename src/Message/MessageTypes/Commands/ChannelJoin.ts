import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface ChannelJoinFields {
	channel: string;
	key?: string;
}

export interface ChannelJoin extends ChannelJoinFields {}
export class ChannelJoin extends Message<ChannelJoinFields> {
	static readonly COMMAND = 'JOIN';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			channel: { type: 'channel' },
			key: { optional: true }
		});
	}
}
