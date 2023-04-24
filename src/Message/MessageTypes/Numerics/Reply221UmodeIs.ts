import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Reply221UmodeIsFields {
	me: string;
	modes: string;
}

export interface Reply221UmodeIs extends Reply221UmodeIsFields {}
export class Reply221UmodeIs extends Message<Reply221UmodeIsFields> {
	static readonly COMMAND = '221';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			modes: {}
		});
	}
}
