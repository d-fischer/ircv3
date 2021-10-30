import type { Capability } from '../../Capability';
import { Acknowledgement } from './MessageTypes/Commands/Acknowledgement';

export const LabeledResponseCapability: Capability = {
	name: 'labeled-response',
	messageTypes: [Acknowledgement],
	usesTags: true
};
