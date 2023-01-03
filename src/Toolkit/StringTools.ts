import escapeRegexString from '@d-fischer/escape-string-regexp';
import { splitWithLimit } from '@d-fischer/shared-utils';

export function sanitizeParameter(param: string, spaceAllowed: boolean = false): string {
	if (spaceAllowed) {
		return param.replace(/[\0\r\n]/g, '');
	} else {
		return param.replace(/[\0\r\n ]/g, '');
	}
}

export function isChannel(str: string, validTypes: string = '#&'): boolean {
	const re = new RegExp(`^[${escapeRegexString(validTypes)}][^ \b\0\n\r,]+$`);
	return re.test(str);
}

export interface ParsedCtcp {
	command: string;
	params: string;
}

/* eslint-disable @typescript-eslint/naming-convention */
const ctcpEscapeMap: Record<string, string> = {
	0: '\0',
	n: '\n',
	r: '\r',
	'\x10': '\x10'
};
/* eslint-enable @typescript-eslint/naming-convention */

export function decodeCtcp(message: string): ParsedCtcp | false {
	if (!message.startsWith('\x01')) {
		// this is not a CTCP message
		return false;
	}

	message = message.substring(1);
	// remove trailing \x01 if present
	if (message.endsWith('\x01')) {
		message = message.slice(0, -1);
	}

	if (!message) {
		// completely empty CTCPs don't exist either, I think
		return false;
	}

	// unescape weirdly escaped stuff
	message = message.replace(/\x10(.)/, (_, escapedChar: string) =>
		escapedChar in ctcpEscapeMap ? ctcpEscapeMap[escapedChar] : ''
	);

	let [command, params = ''] = splitWithLimit(message, ' ', 2);
	command = command ? command.toUpperCase() : '';

	return { command, params };
}
