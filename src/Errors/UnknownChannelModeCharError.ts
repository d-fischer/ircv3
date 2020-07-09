export class UnknownChannelModeCharError extends Error {
	constructor(private readonly _char: string) {
		super(`Unknown channel mode character ${_char}`);

		Object.setPrototypeOf(this, UnknownChannelModeCharError.prototype);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnknownChannelModeCharError);
		}
	}

	get char(): string {
		return this._char;
	}
}
