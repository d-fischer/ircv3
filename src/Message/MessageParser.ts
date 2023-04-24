import { splitWithLimit } from '@d-fischer/shared-utils';
import type { ServerProperties } from '../ServerProperties';
import { defaultServerProperties } from '../ServerProperties';
import type { MessageConstructor, MessageParam, MessagePrefix } from './Message';
import { Message } from './Message';
import { all as coreMessageTypes } from './MessageTypes';

export function parsePrefix(raw: string): MessagePrefix {
	const [nick, hostName] = splitWithLimit(raw, '!', 2);
	if (hostName) {
		const [user, host] = splitWithLimit(hostName, '@', 2);
		if (host) {
			return { nick, user, host };
		} else {
			return { nick, host: user };
		}
	} else {
		return { nick };
	}
}

const tagUnescapeMap: Record<string, string> = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	':': ';',
	n: '\n',
	r: '\r',
	s: ' '
};

export function parseTags(raw: string): Map<string, string> {
	const tags = new Map<string, string>();
	const tagStrings = raw.split(';');
	for (const tagString of tagStrings) {
		const [tagName, tagValue] = splitWithLimit(tagString, '=', 2);
		if (tagName === '') {
			continue; // Ignore empty tags: @ @; etc.
		}
		// unescape according to http://ircv3.net/specs/core/message-tags-3.2.html#escaping-values
		tags.set(
			tagName,
			tagValue
				? tagValue.replace(/\\(.?)/g, (_, match: string) =>
						Object.prototype.hasOwnProperty.call(tagUnescapeMap, match) ? tagUnescapeMap[match] : match
				  )
				: ''
		);
	}

	return tags;
}

export function parseMessage(
	rawLine: string,
	serverProperties: ServerProperties = defaultServerProperties,
	knownCommands: Map<string, MessageConstructor> = coreMessageTypes,
	isServer: boolean = false,
	nonConformingCommands: string[] = [],
	shouldParseParams: boolean = true
): Message {
	const splitLine: string[] = rawLine.split(' ');
	// eslint-disable-next-line @typescript-eslint/init-declarations
	let token: string;

	// eslint-disable-next-line @typescript-eslint/init-declarations
	let command: string | undefined;
	const params: MessageParam[] = [];
	let tags: Map<string, string> | undefined = undefined;
	// eslint-disable-next-line @typescript-eslint/init-declarations
	let prefix: MessagePrefix | undefined;

	while (splitLine.length) {
		token = splitLine[0];
		if (token.startsWith('@') && !tags && !command && !prefix) {
			tags = parseTags(token.slice(1));
		} else if (token.startsWith(':')) {
			if (!prefix && !command) {
				if (token.length > 1) {
					// Not an empty prefix
					prefix = parsePrefix(token.slice(1));
				}
			} else {
				params.push({
					value: splitLine.join(' ').slice(1),
					trailing: true
				});
				break;
			}
		} else if (command) {
			params.push({
				value: token,
				trailing: false
			});
		} else {
			command = token.toUpperCase();
		}
		splitLine.shift();
	}

	if (!tags) {
		tags = new Map<string, string>();
	}

	if (!command) {
		throw new Error(`line without command received: ${rawLine}`);
	}

	shouldParseParams &&= !nonConformingCommands.includes(command);

	let messageClass: MessageConstructor = Message;
	if (knownCommands.has(command)) {
		messageClass = knownCommands.get(command)!;
	}

	return new messageClass(
		command,
		{
			params,
			tags,
			prefix,
			rawLine
		},
		{
			serverProperties,
			isServer,
			shouldParseParams
		}
	);
}
