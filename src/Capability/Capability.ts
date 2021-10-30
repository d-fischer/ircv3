import type { MessageConstructor } from '../Message/Message';

export interface Capability {
	name: string;
	messageTypes?: MessageConstructor[];
	usesTags?: boolean;
}

export type ServerCapability = Capability & {
	param?: string;
};
