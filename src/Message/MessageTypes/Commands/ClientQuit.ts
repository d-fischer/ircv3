import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface ClientQuitFields {
	text?: string;
}

export interface ClientQuit extends ClientQuitFields {}
export class ClientQuit extends Message<ClientQuitFields> {
	static readonly COMMAND = 'QUIT';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			text: { trailing: true, optional: true }
		});
	}
}
