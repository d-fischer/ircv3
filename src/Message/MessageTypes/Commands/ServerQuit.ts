import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ServerQuitParams {
	server: MessageParam;
	message: MessageParam;
}

export default class ServerQuit extends Message<ServerQuitParams> {
	public static readonly COMMAND = 'SQUIT';
	public static readonly PARAM_SPEC: MessageParamSpec<ServerQuit> = {
		server: {},
		message: {
			trailing: true
		}
	};
}
