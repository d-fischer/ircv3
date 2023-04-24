import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface Error404CanNotSendToChanFields {
	me: string;
	channel: string;
	suffix: string;
}

export interface Error404CanNotSendToChan extends Error404CanNotSendToChanFields {}
export class Error404CanNotSendToChan extends Message<Error404CanNotSendToChanFields> {
	static readonly COMMAND = '404';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			me: {},
			channel: { type: 'channel' },
			suffix: { trailing: true }
		});
	}
}
