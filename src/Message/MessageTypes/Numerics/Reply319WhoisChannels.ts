import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply319WhoisChannelsFields {
	me: string;
	nick: string;
	channels: string;
}

export interface Reply319WhoisChannels extends Reply319WhoisChannelsFields {}
export class Reply319WhoisChannels extends Message<Reply319WhoisChannelsFields> {
	static readonly COMMAND = '319';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			nick: {},
			channels: { trailing: true }
		});
	}
}
