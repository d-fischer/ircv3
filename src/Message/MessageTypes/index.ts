import type { MessageConstructor } from '../Message';
import * as Commands from './Commands';
import * as Numerics from './Numerics';

export { Commands, Numerics };

export const all = new Map(
	([...Object.values(Commands), ...Object.values(Numerics)] as MessageConstructor[]).map(
		(cmd): [string, MessageConstructor] => [cmd.COMMAND, cmd]
	)
);
