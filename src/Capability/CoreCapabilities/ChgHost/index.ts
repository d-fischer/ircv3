import Capability from '../../Capability';
import ChangeHost from './MessageTypes/Commands/ChangeHost';

const ChgHostCapability: Capability = {
	name: 'chghost',
	messageTypes: [ChangeHost]
};

export default ChgHostCapability;
