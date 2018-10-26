import Message, { MessageConstructor, MessageParam, MessagePrefix } from './Message';
import { all as coreMessageTypes } from './MessageTypes';
import { ServerProperties, defaultServerProperties } from '../ServerProperties';

export default function parseMessage(line: string, serverProperties: ServerProperties = defaultServerProperties, knownCommands: Map<string, MessageConstructor> = coreMessageTypes): Message {
	const splitLine: string[] = line.split(' ');
	let token: string;

	let command: string | undefined;
	const params: MessageParam[] = [];
	let tags: Map<string, string> | undefined;
	let prefix: MessagePrefix | undefined;

	while (splitLine.length) {
		token = splitLine[0];
		if (token[0] === '@' && !tags && !command) {
			tags = parseTags(token.substr(1));
		} else if (token[0] === ':') {
			if (!prefix && !command) {
				prefix = parsePrefix(token.substr(1));
			} else {
				params.push({
					value: splitLine.join(' ').substr(1),
					trailing: true
				});
				break;
			}
		} else if (!command) {
			command = token.toUpperCase();
		} else {
			params.push({
				value: token,
				trailing: false
			});
		}
		splitLine.shift();
	}

	if (!command) {
		throw new Error(`line without command received: ${line}`);
	}

	let message: Message;

	let messageClass: MessageConstructor = Message;
	if (knownCommands.has(command)) {
		messageClass = knownCommands.get(command)!;
	}

	// tslint:disable-next-line:no-inferred-empty-object-type
	message = new messageClass(command, params, tags, prefix, serverProperties, line);

	return message;
}

export function parsePrefix(raw: string): MessagePrefix {
	const [nick, hostName] = raw.split('!', 2);
	if (hostName) {
		const [user, host] = hostName.split('@', 2);
		if (host) {
			return { nick, user, host };
		} else {
			return { nick, host: user };
		}
	} else {
		return { nick };
	}
}

const tagUnescapeMap: { [char: string]: string } = {
	'\\': '\\',
	':': ';',
	n: '\n',
	r: '\r',
	s: ' '
};

export function parseTags(raw: string): Map<string, string> {
	const tags: Map<string, string> = new Map();
	const tagStrings = raw.split(';');
	for (const tagString of tagStrings) {
		const [tagName, tagValue] = tagString.split('=', 2);
		// unescape according to http://ircv3.net/specs/core/message-tags-3.2.html#escaping-values
		tags.set(tagName, tagValue.replace(/\\([\\:nrs])/g, (_, match) => tagUnescapeMap[match]));
	}

	return tags;
}
