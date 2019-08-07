import escapeRegexString = require('escape-string-regexp');

export { escapeRegexString };

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
		// tslint:enable:no-bitwise
	} while (length);

	return paddingStr + str;
}

export function isChannel(str: string, validTypes: string = '#&') {
	const re = new RegExp(`^[${escapeRegexString(validTypes)}][^ \b\0\n\r,]+$`);
	return re.test(str);
}

export interface ParsedCtcp {
	command: string;
	params: string;
}

const ctcpEscapeMap: {[char: string]: string} = {
	0: '\0',
	n: '\n',
	r: '\r',
	'\x10': '\x10'
};

export function splitWithLimit(str: string, delim: string, count: number) {
	const parts = str.split(delim);
	if (parts.length <= count) {
		return parts;
	}
	return [...parts.slice(0, count - 1), parts.slice(count - 1).join(delim)];
}

export function decodeCtcp(message: string): ParsedCtcp | false {
	if (message[0] !== '\x01') {
		// this is not a CTCP message
		return false;
	}

	message = message.substring(1);
	// remove trailing \x01 if present
	if (message.slice(-1) === '\x01') {
		message = message.slice(0, -1);
	}

	if (!message) {
		// completely empty CTCPs don't exist either, I think
		return false;
	}

	// unescape weirdly escaped stuff
	message = message.replace(/\x10(.)/, (_, escapedChar) =>
		(escapedChar in ctcpEscapeMap) ? ctcpEscapeMap[escapedChar] : '');

	let [command, params = ''] = splitWithLimit(message, ' ', 2);
	command = command ? command.toUpperCase() : '';

	return { command, params };
}
