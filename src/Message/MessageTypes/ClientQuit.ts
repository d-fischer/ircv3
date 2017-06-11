import Message, {MessageParam, MessageParamSpec} from '../Message';

export interface ClientQuitParams {
	message: MessageParam;
}

export default class ClientQuit extends Message<ClientQuitParams> {
	public static readonly COMMAND = 'QUIT';
	public static readonly PARAM_SPEC: MessageParamSpec<ClientQuitParams> = {
		message: {
			trailing: true
		}
	};
}
