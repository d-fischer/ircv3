import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface PasswordFields {
	password: string;
}

export interface Password extends PasswordFields {}
export class Password extends Message<PasswordFields> {
	static readonly COMMAND = 'PASS';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			password: {}
		});
	}
}
