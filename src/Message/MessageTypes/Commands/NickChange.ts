import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface NickChangeFields {
	nick: string;
}

export interface NickChange extends NickChangeFields {}
export class NickChange extends Message<NickChangeFields> {
	static readonly COMMAND = 'NICK';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			nick: {}
		});
	}
}
