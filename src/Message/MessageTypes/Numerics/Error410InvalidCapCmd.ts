import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error410InvalidCapCmdFields {
	me: string;
	subCommand: string;
	suffix: string;
}

export interface Error410InvalidCapCmd extends Error410InvalidCapCmdFields {}
export class Error410InvalidCapCmd extends Message<Error410InvalidCapCmdFields> {
	static readonly COMMAND = '410';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			subCommand: {},
			suffix: { trailing: true }
		});
	}
}
