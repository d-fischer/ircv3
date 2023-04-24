import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply001WelcomeFields {
	me: string;
	welcomeText: string;
}

export interface Reply001Welcome extends Reply001WelcomeFields {}
export class Reply001Welcome extends Message<Reply001WelcomeFields> {
	static readonly COMMAND = '001';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			welcomeText: {
				trailing: true
			}
		});
	}
}
