import type { Commands } from '../Message/MessageTypes';

export class MessageError extends Error {
	readonly ircMessage: Commands.ErrorMessage;

	constructor(msg: Commands.ErrorMessage) {
		super(`Received error from IRC server: ${msg.rawLine ?? '[message internally built]'}`);

		this.ircMessage = msg;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	get name(): string {
		return this.constructor.name;
	}
}
