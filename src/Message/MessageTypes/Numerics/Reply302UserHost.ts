import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply302UserHostFields {
	me: string;
	hosts: string;
}

export interface Reply302UserHost extends Reply302UserHostFields {}
export class Reply302UserHost extends Message<Reply302UserHostFields> {
	static readonly COMMAND = '302';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			hosts: { trailing: true }
		});
	}
}
