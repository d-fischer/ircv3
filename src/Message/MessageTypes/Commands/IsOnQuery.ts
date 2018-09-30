import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface IsOnQueryParams {
	nicks: MessageParam;
}

export default class IsOnQuery extends Message<IsOnQueryParams> {
	static readonly COMMAND = 'ISON';
	static readonly PARAM_SPEC: MessageParamSpec<IsOnQuery> = {
		nicks: {
			rest: true
		}
	};
}
