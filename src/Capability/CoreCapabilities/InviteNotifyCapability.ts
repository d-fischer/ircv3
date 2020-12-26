import type { Capability } from '../Capability';

// dummy capability, this capability reuses the same INVITE sytax from rfc1459 for broadcasts
export const InviteNotifyCapability: Capability = {
	name: 'invite-notify'
};
