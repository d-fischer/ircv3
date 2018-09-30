import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface WhoIsQueryParams {
	server: MessageParam;
	nickMask: MessageParam;
}

export default class WhoIsQuery extends Message<WhoIsQueryParams> {
	static readonly COMMAND = 'WHOIS';
	static readonly PARAM_SPEC: MessageParamSpec<WhoIsQuery> = {
		server: {
			optional: true
		},
		nickMask: {}
	};
}
