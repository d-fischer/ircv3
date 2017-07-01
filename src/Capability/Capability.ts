import {MessageConstructor} from '../Message/Message';

interface Capability {
	name: string;
	messageTypes?: MessageConstructor[];
}

export default Capability;

export type ServerCapability = Capability & {
	param?: string;
};
