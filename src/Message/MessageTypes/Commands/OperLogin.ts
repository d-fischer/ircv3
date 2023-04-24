import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface OperLoginFields {
	name: string;
	password: string;
}

export interface OperLogin extends OperLoginFields {}
export class OperLogin extends Message<OperLoginFields> {
	static readonly COMMAND = 'OPER';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			name: {},
			password: {}
		});
	}
}
