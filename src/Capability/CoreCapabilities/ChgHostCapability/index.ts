import Capability from '../../Capability';
import ChgHost from './MessageTypes/Commands/ChgHost';

const ChgHostCapability: Capability = {
	name: 'chghost',
	messageTypes: [ChgHost]
};

export default ChgHostCapability;
