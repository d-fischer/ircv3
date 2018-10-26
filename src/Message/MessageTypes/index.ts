import * as Commands from './Commands';
import * as Numerics from './Numerics';
import ObjectTools from '../../Toolkit/ObjectTools';
import { MessageConstructor } from '../Message';

export { Commands, Numerics };

export const all = {
	...ObjectTools.indexBy([...Object.values(Commands), ...Object.values(Numerics)] as MessageConstructor[], 'COMMAND')
};
