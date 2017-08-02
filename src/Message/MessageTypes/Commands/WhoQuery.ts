import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface WhoQueryParams {
	mask: MessageParam;
	flag: MessageParam;
}

export default class WhoQuery extends Message<WhoQueryParams> {
	public static readonly COMMAND = 'WHO';
	public static readonly PARAM_SPEC: MessageParamSpec<WhoQueryParams> = {
		mask: {
			optional: true
		},
		flag: {
			match: /^o$/,
			optional: true
		}
	};
}
