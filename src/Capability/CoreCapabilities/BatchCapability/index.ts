import type { Capability } from '../../Capability';
import { Batch } from './MessageTypes/Commands/Batch';

export const BatchCapability: Capability = {
	name: 'batch',
	messageTypes: [Batch],
	usesTags: true
};
