import { createMessage } from '../Message';
import { PrivateMessage } from '../MessageTypes/Commands';

describe('Message', () => {
	it('should correctly stringify a PrivateMessage with tags', () => {
		const message = createMessage(
			PrivateMessage,
			{ target: '#channel', text: 'A message with tags' },
			undefined,
			new Map([['my-tag', 'value']])
		);

		expect(message.toString()).toEqual('@my-tag=value PRIVMSG #channel :A message with tags');
	});

	it('should not include a PrivateMessage prefix by default', () => {
		const message = createMessage(
			PrivateMessage,
			{ target: '#channel', text: 'A message with a prefix' },
			{
				nick: 'nick'
			}
		);

		expect(message.toString()).toEqual('PRIVMSG #channel :A message with a prefix');
	});
});
