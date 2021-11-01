import type { Capability } from '../Capability';

// dummy capability, this capability reuses the IRCv3 CAP command with a new subcommand
export const CapNotifyCapability: Capability = {
	name: 'cap-notify'
};
