import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Error462AlreadyRegisteredParams {
	me: MessageParam;
	text: MessageParam;
}

export default class Error462AlreadyRegistered extends Message<Error462AlreadyRegisteredParams> {
	public static readonly COMMAND = '001';
	public static readonly PARAM_SPEC: MessageParamSpec<Error462AlreadyRegisteredParams> = {
		me: {},
		text: {
			trailing: true
		}
	};
}
