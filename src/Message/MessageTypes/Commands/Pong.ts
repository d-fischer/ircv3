import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PongParams {
	server: MessageParam;
	message: MessageParam;
}

export default class Pong extends Message<PongParams> {
	static readonly COMMAND = 'PONG';
	static readonly PARAM_SPEC: MessageParamSpec<Pong> = {
		server: {
			optional: true
		},
		message: {
			trailing: true
		}
	};
}
