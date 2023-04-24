import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error475BadChannelKeyFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error475BadChannelKey extends Error475BadChannelKeyFields {}
export class Error475BadChannelKey extends Message<Error475BadChannelKeyFields> {
	static readonly COMMAND = '475';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
