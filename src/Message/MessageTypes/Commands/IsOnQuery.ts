import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface IsOnQueryFields {
	nicks: string;
}

export interface IsOnQuery extends IsOnQueryFields {}
export class IsOnQuery extends Message<IsOnQueryFields> {
	static readonly COMMAND = 'ISON';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			nicks: { rest: true }
		});
	}
}
