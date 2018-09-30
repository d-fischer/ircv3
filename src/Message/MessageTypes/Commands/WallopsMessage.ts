import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface WallopsMessageParams {
	message: MessageParam;
}

export default class WallopsMessage extends Message<WallopsMessageParams> {
	static readonly COMMAND = 'WALLOPS';
	static readonly PARAM_SPEC: MessageParamSpec<WallopsMessage> = {
		message: {
			trailing: true
		}
	};
}
