import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface WallopsMessageParams {
	message: MessageParam;
}

export default class WallopsMessage extends Message<WallopsMessageParams> {
	public static readonly COMMAND = 'WALLOPS';
	public static readonly PARAM_SPEC: MessageParamSpec<WallopsMessageParams> = {
		message: {
			trailing: true
		}
	};
}
