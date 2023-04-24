import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../../../../Message/Message';

interface ChgHostFields {
	newUser: string;
	newHost: string;
}

export interface ChgHost extends ChgHostFields {}
export class ChgHost extends Message<ChgHostFields> {
	static readonly COMMAND = 'CHGHOST';
	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			newUser: {},
			newHost: {}
		});
	}
}
