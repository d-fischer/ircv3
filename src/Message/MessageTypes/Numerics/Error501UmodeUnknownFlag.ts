import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error501UmodeUnknownFlagFields {
	me: string;
	modeChar?: string;
	suffix: string;
}

export interface Error501UmodeUnknownFlag extends Error501UmodeUnknownFlagFields {}
export class Error501UmodeUnknownFlag extends Message<Error501UmodeUnknownFlagFields> {
	static readonly COMMAND = '501';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			modeChar: { optional: true, match: /^\w$/ },
			suffix: { trailing: true }
		});
	}
}
