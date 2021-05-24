import { parseMessage, parseTags } from '../MessageParser';
import { PrivateMessage } from '../MessageTypes/Commands';

describe('Message parser', () => {
	it('parses a standard message without tags', () => {
		const msg = parseMessage(':a!b@c PRIVMSG #test :hi') as PrivateMessage;

		expect(msg).toBeInstanceOf(PrivateMessage);
		expect(msg.prefix).toStrictEqual({ nick: 'a', user: 'b', host: 'c' });
		expect(msg.params).toStrictEqual({ target: '#test', content: 'hi' });
		expect(msg.tags).not.toBeUndefined();
		expect(msg.tags.size).toBe(0);
	});

	it('parses a standard message with tags', () => {
		const msg = parseMessage('@foo=bar;no-val; :a!b@c PRIVMSG #test :hi') as PrivateMessage;

		expect(msg).toBeInstanceOf(PrivateMessage);
		expect(msg.prefix).toStrictEqual({ nick: 'a', user: 'b', host: 'c' });
		expect(msg.params).toStrictEqual({ target: '#test', content: 'hi' });
		expect(msg.tags).not.toBeUndefined();
		expect(msg.tags.size).toBe(2);
		expect(msg.tags.get('foo')).toBe('bar');
		expect(msg.tags.get('no-val')).toBe('');
	});

	it('parses tags only at the beginning of the message', () => {
		const msg = parseMessage(':a!b@c @foo=bar PRIVMSG #test :hi');

		expect(msg).not.toBeInstanceOf(PrivateMessage);
		expect(msg.command).toBe('@FOO=BAR');
		expect(msg.tags).not.toBeUndefined();
		expect(msg.tags.size).toBe(0);
	});

	it('parses tag escapes properly', () => {
		const tags = parseTags("text=it'sa\\sme\\:\\sMario!\\\\\\r\\n\\;test=\\p\\ass\\e\\d\\\\\\!");

		expect(tags).not.toBeUndefined();
		expect(tags.size).toBe(2);
		expect(tags.get('text')).toBe("it'sa me; Mario!\\\r\n");
		expect(tags.get('test')).toBe('passed\\!');
	});
});
