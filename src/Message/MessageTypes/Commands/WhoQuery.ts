import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface WhoQueryFields {
	mask: string;
	flags?: string;
	extendedMask?: string;
}

export interface WhoQuery extends WhoQueryFields {}
export class WhoQuery extends Message<WhoQueryFields> {
	static readonly COMMAND = 'WHO';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			mask: {},
			flags: { optional: true },
			extendedMask: { optional: true, trailing: true }
		});
	}
}
