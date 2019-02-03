export interface SupportedModesByType {
	prefix: string;
	list: string;
	alwaysWithParam: string;
	paramWhenSet: string;
	noParam: string;
}

export interface AccessLevelDefinition {
	modeChar: string;
	prefix: string;
}

export interface ServerProperties {
	channelTypes: string;
	supportedUserModes: string;
	supportedChannelModes: SupportedModesByType;
	prefixes: AccessLevelDefinition[];
}

// sane defaults based on RFC 1459
export const defaultServerProperties: ServerProperties = {
	channelTypes: '#&',
	supportedUserModes: 'iwso',
	supportedChannelModes: {
		prefix: 'ov',
		list: 'b',
		alwaysWithParam: 'ovk',
		paramWhenSet: 'l',
		noParam: 'imnpst'
	},
	prefixes: [
		{
			modeChar: 'v',
			prefix: '+'
		},
		{
			modeChar: 'o',
			prefix: '@'
		}
	]
};
