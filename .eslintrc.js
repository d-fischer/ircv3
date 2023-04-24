module.exports = {
	extends: ['@d-fischer'],
	overrides: [
		{
			files: ['src/Message/MessageTypes/**/*.ts', 'src/Capability/CoreCapabilities/**/Commands/*.ts'],
			rules: {
				'@typescript-eslint/no-empty-interface': 'off'
			}
		}
	]
};
