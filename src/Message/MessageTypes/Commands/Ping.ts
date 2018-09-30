import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface PingParams {
	message: MessageParam;
}

export default class Ping extends Message<PingParams> {
	static readonly COMMAND = 'PING';
	static readonly PARAM_SPEC: MessageParamSpec<Ping> = {
		message: {
			trailing: true
		}
	};
}
