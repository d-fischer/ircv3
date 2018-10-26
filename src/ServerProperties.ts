export interface SupportedChannelModes {
	list: string;
	alwaysWithParam: string;
	paramWhenSet: string;
	noParam: string;
}

export interface ServerProperties {
	channelTypes: string;
	supportedUserModes: string;
	supportedChannelModes: SupportedChannelModes;
}

// sane defaults based on RFC 1459
export const defaultServerProperties: ServerProperties = {
	channelTypes: '#&',
	supportedUserModes: 'iwso',
	supportedChannelModes: {
		list: 'b',
		alwaysWithParam: 'ovk',
		paramWhenSet: 'l',
		noParam: 'imnpst'
	}
};
