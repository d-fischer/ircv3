import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply311WhoisUserFields {
	me: string;
	nick: string;
	username: string;
	host: string;
	_unused: string;
	realname: string;
}

export interface Reply311WhoisUser extends Reply311WhoisUserFields {}
export class Reply311WhoisUser extends Message<Reply311WhoisUserFields> {
	static readonly COMMAND = '311';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			nick: {},
			username: {},
			host: {},
			_unused: {},
			realname: { trailing: true }
		});
	}
}
