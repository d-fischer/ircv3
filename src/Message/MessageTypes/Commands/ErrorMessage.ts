import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface ErrorMessageFields {
	text: string;
}

export interface ErrorMessage extends ErrorMessageFields {}
export class ErrorMessage extends Message<ErrorMessageFields> {
	static readonly COMMAND = 'ERROR';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			text: { trailing: true }
		});
	}
}
