export default class NotEnoughParametersError extends Error {
	constructor(private readonly _command: string, private readonly _expectedParams: number, private readonly _actualParams: number) {
		super(`command "${_command}" expected ${_expectedParams} or more parameters, got ${_actualParams}`);

		Object.setPrototypeOf(this, NotEnoughParametersError.prototype);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NotEnoughParametersError);
		}
	}

	get command(): string {
		return this._command;
	}

	get expectedParams(): number {
		return this._expectedParams;
	}

	get actualParams(): number {
		return this._actualParams;
	}
}
