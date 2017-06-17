import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface ErrorParams {
	message: MessageParam;
}

export default class Error extends Message<ErrorParams> {
	public static readonly COMMAND = 'ERROR';
	public static readonly PARAM_SPEC: MessageParamSpec<ErrorParams> = {
		message: {
			trailing: true
		}
	};
}
