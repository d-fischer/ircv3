import type { MessageConstructor } from '../Message/Message';

export interface Capability {
	name: string;
	messageTypes?: MessageConstructor[];
}

export type ServerCapability = Capability & {
	param?: string;
};
