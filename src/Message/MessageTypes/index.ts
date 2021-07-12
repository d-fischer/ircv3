import type { Message, MessageConstructor } from '../Message';
import * as Commands from './Commands';
import * as Numerics from './Numerics';

export { Commands, Numerics };

export const all = new Map(
	([...Object.values(Commands), ...Object.values(Numerics)] as Array<MessageConstructor<Message>>).map(
		(cmd): [string, MessageConstructor<Message>] => [cmd.COMMAND, cmd]
	)
);
