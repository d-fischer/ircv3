import type { Message } from '../Message/Message';

export class NotEnoughParametersError extends Error {
	constructor(private readonly _message: Message, private readonly _expectedParams: number) {
		super(
			`command "${_message.command}" expected ${_expectedParams} or more parameters, got ${_message.paramCount}`
		);

		Object.setPrototypeOf(this, NotEnoughParametersError.prototype);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NotEnoughParametersError);
		}
	}

	get parsedMessage(): Message {
		return this._message;
	}

	get command(): string {
		return this._message.command;
	}

	get expectedParams(): number {
		return this._expectedParams;
	}

	get actualParams(): number {
		return this._message.paramCount;
	}
}
