import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply324ChannelModeIsFields {
	me: string;
	channel: string;
	modes: string;
}

export interface Reply324ChannelModeIs extends Reply324ChannelModeIsFields {}
export class Reply324ChannelModeIs extends Message<Reply324ChannelModeIsFields> {
	static readonly COMMAND = '324';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			modes: { rest: true }
		});
	}
}
