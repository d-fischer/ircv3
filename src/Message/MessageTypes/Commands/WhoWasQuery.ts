import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface WhoWasQueryParams {
	nickname: MessageParam;
	count: MessageParam;
	server: MessageParam;
}

export default class WhoWasQuery extends Message<WhoWasQueryParams> {
	static readonly COMMAND = 'WHOWAS';
	static readonly PARAM_SPEC: MessageParamSpec<WhoWasQuery> = {
		nickname: {},
		count: {
			optional: true
		},
		server: {
			optional: true
		}
	};
}
