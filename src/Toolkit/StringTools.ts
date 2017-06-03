export function sanitizeParameter(param: string, spaceAllowed: boolean = false) {
	if (spaceAllowed) {
		return param.replace(/[\0\r\n]/g, '');
	} else {
		return param.replace(/[\0\r\n ]/g, '');
	}
}

export function padLeft(str: string | number, length: number, padding?: string) {
	if (typeof str === 'number') {
		str = str.toString();
	}

	length = length - str.length;
	if (length <= 0) {
		return str;
	}

	if (padding === undefined) {
		padding = ' ';
	}

	let paddingStr = '';

	do {
		// tslint:disable:no-bitwise
		if ((length & 1) === 1) {
			paddingStr += padding;
		}
		length >>= 1;
		if (length) {
			padding += padding;
		}
		// tslint:enabled:no-bitwise
	} while (length);

	return paddingStr + str;
}
