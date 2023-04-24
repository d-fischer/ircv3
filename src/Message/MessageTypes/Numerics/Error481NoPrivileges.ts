import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error481NoPrivilegesFields {
	me: string;
	suffix: string;
}

export interface Error481NoPrivileges extends Error481NoPrivilegesFields {}
export class Error481NoPrivileges extends Message<Error481NoPrivilegesFields> {
	static readonly COMMAND = '481';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			suffix: { trailing: true }
		});
	}
}
