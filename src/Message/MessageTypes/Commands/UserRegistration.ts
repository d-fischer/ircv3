import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface UserRegistrationFields {
	user: string;
	mode: string;
	unused: string;
	realName: string;
}

export interface UserRegistration extends UserRegistrationFields {}
export class UserRegistration extends Message<UserRegistrationFields> {
	static readonly COMMAND = 'USER';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			user: {},
			mode: {},
			unused: {},
			realName: { trailing: true }
		});
	}
}
