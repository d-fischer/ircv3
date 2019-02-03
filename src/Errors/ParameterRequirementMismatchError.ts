import { MessageParamSpecEntry } from '../Message/Message';

export default class ParameterRequirementMismatchError extends Error {
	constructor(private readonly _command: string, private readonly _paramName: string, private readonly _paramSpec: MessageParamSpecEntry, private readonly _givenValue: string) {
		super(`required parameter "${_paramName}" did not validate against ${_paramSpec.type || 'regex'} validation: "${_givenValue}"`);

		Object.setPrototypeOf(this, ParameterRequirementMismatchError.prototype);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ParameterRequirementMismatchError);
		}
	}

	get command(): string {
		return this._command;
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
