import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error461NeedMoreParamsFields {
	me: string;
	originalCommand: string;
	suffix: string;
}

export interface Error461NeedMoreParams extends Error461NeedMoreParamsFields {}
export class Error461NeedMoreParams extends Message<Error461NeedMoreParamsFields> {
	static readonly COMMAND = '461';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			originalCommand: {},
			suffix: { trailing: true }
		});
	}
}
