import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface ClientQuitParams {
	message: MessageParam;
}

export default class ClientQuit extends Message<ClientQuitParams> {
	static readonly COMMAND = 'QUIT';
	static readonly PARAM_SPEC: MessageParamSpec<ClientQuit> = {
		message: {
			trailing: true,
			optional: true
		}
	};
}
