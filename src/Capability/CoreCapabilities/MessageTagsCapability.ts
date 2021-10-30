import type { Capability } from '../Capability';

// dummy capability, TAGMSG is a core command due to other capabilities' implicit dependency on it
export const MessageTagsCapability: Capability = {
	name: 'message-tags',
	usesTags: true
};
