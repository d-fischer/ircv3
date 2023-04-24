import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface ChannelInviteFields {
	target: string;
	channel: string;
}

export interface ChannelInvite extends ChannelInviteFields {}
export class ChannelInvite extends Message<ChannelInviteFields> {
	static readonly COMMAND = 'INVITE';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			target: {},
			channel: { type: 'channel' }
		});
	}
}
