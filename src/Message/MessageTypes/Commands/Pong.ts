import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface PongParams {
	message: MessageParam;
}

export default class Pong extends Message<PongParams> {
	public static readonly COMMAND = 'PONG';
	public static readonly PARAM_SPEC: MessageParamSpec<PongParams> = {
		message: {
			trailing: true
		}
	};
}
