import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface WhoWasQueryFields {
	nick: string;
	count?: string;
	server?: string;
}

export interface WhoWasQuery extends WhoWasQueryFields {}
export class WhoWasQuery extends Message<WhoWasQueryFields> {
	static readonly COMMAND = 'WHOWAS';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			nick: {},
			count: { optional: true },
			server: { optional: true }
		});
	}
}
