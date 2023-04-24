import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error479BadChanNameFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error479BadChanName extends Error479BadChanNameFields {}
export class Error479BadChanName extends Message<Error479BadChanNameFields> {
	static readonly COMMAND = '479';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: {},
			suffix: { trailing: true }
		});
	}
}
