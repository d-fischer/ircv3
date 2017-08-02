import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface WhoIsQueryParams {
	server: MessageParam;
	nickMask: MessageParam;
}

export default class WhoIsQuery extends Message<WhoIsQueryParams> {
	public static readonly COMMAND = 'WHOIS';
	public static readonly PARAM_SPEC: MessageParamSpec<WhoIsQueryParams> = {
		server: {
			optional: true
		},
		nickMask: {}
	};
}
