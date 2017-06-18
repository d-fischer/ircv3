import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface WhoWasQueryParams {
	nickname: MessageParam;
	count: MessageParam;
	server: MessageParam;
}

export default class WhoWasQuery extends Message<WhoWasQueryParams> {
	public static readonly COMMAND = 'WHOWAS';
	public static readonly PARAM_SPEC: MessageParamSpec<WhoWasQueryParams> = {
		nickname: {},
		count: {
			optional: true
		},
		server: {
			optional: true
		}
	};
}
