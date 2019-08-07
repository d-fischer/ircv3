import Capability from '../Capability';

// dummy capability, this capability reuses the same AWAY sytax from rfc1459 for broadcasts
const AwayNotifyCapability: Capability = {
	name: 'away-notify'
};

export default AwayNotifyCapability;
