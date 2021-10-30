import type { Message, MessageParamSpecEntry } from '../Message/Message';

export class ParameterRequirementMismatchError extends Error {
	constructor(
		private readonly _message: Message,
		private readonly _paramName: string,
		private readonly _paramSpec: MessageParamSpecEntry,
		private readonly _givenValue: string
	) {
		super(
			`required parameter "${_paramName}" did not validate against ${
				_paramSpec.type ?? 'regex'
			} validation: "${_givenValue}"`
		);

		Object.setPrototypeOf(this, ParameterRequirementMismatchError.prototype);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ParameterRequirementMismatchError);
		}
	}

	get parsedMessage(): Message {
		return this._message;
	}

	get command(): string {
		return this._message.command;
	}

	get paramName(): string {
		return this._paramName;
	}

	get paramSpec(): MessageParamSpecEntry {
		return this._paramSpec;
	}

	get givenValue(): string {
		return this._givenValue;
	}
}
