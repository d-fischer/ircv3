import type { Capability } from '../../Capability';
import { ChgHost } from './MessageTypes/Commands/ChgHost';

export const ChgHostCapability: Capability = {
	name: 'chghost',
	messageTypes: [ChgHost]
};
