import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PongParams {
	server: MessageParam;
	message: MessageParam;
}

export default class Pong extends Message<PongParams> {
	public static readonly COMMAND = 'PONG';
	public static readonly PARAM_SPEC: MessageParamSpec<Pong> = {
		server: {
			optional: true
		},
		message: {
			trailing: true
		}
	};
}
