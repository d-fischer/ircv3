import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface IsOnQueryParams {
	nicks: MessageParam;
}

export default class IsOnQuery extends Message<IsOnQueryParams> {
	public static readonly COMMAND = 'ISON';
	public static readonly PARAM_SPEC: MessageParamSpec<IsOnQueryParams> = {
		nicks: {
			rest: true
		}
	};
}
