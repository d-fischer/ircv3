import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface UserHostQueryParams {
	nicks: MessageParam;
}

export default class UserHostQuery extends Message<UserHostQueryParams> {
	static readonly COMMAND = 'USERHOST';
	static readonly PARAM_SPEC: MessageParamSpec<UserHostQuery> = {
		nicks: {
			rest: true
		}
	};
}
