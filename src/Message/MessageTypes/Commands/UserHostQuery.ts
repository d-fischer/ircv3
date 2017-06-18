import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface UserHostQueryParams {
	nicks: MessageParam;
}

export default class UserHostQuery extends Message<UserHostQueryParams> {
	public static readonly COMMAND = 'USERHOST';
	public static readonly PARAM_SPEC: MessageParamSpec<UserHostQueryParams> = {
		nicks: {
			rest: true
		}
	};
}
