import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface ChannelKickFields {
	channel: string;
	target: string;
	reason?: string;
}

export interface ChannelKick extends ChannelKickFields {}
export class ChannelKick extends Message<ChannelKickFields> {
	static readonly COMMAND = 'KICK';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			channel: { type: 'channel' },
			target: {},
			reason: { trailing: true, optional: true }
		});
	}
}
