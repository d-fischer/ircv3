import Capability from '../Capability';

// dummy capability, this capability reuses the same INVITE sytax from rfc1459 for broadcasts
const InviteNotifyCapability: Capability = {
	name: 'invite-notify'
};

export default InviteNotifyCapability;
