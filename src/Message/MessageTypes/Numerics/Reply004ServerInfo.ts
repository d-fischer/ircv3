import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply004ServerInfoFields {
	me: string;
	serverName: string;
	version: string;
	userModes: string;
	channelModes: string;
	channelModesWithParam?: string;
}

export interface Reply004ServerInfo extends Reply004ServerInfoFields {}
export class Reply004ServerInfo extends Message<Reply004ServerInfoFields> {
	static readonly COMMAND = '004';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			serverName: {},
			version: {},
			userModes: {},
			channelModes: {},
			channelModesWithParam: {
				optional: true
			}
		});
	}
}
