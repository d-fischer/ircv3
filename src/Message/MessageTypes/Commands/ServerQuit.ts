import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ServerQuitParams {
	server: MessageParam;
	message: MessageParam;
}

export default class ServerQuit extends Message<ServerQuitParams> {
	static readonly COMMAND = 'SQUIT';
	static readonly PARAM_SPEC: MessageParamSpec<ServerQuit> = {
		server: {},
		message: {
			trailing: true
		}
	};
}
