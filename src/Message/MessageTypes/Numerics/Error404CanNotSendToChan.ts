import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error404CanNotSendToChanParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Error404CanNotSendToChan extends Message<Error404CanNotSendToChanParams> {
	static readonly COMMAND = '404';
	static readonly PARAM_SPEC: MessageParamSpec<Error404CanNotSendToChan> = {
		me: {},
		channel: {
			type: 'channel'
		},
		suffix: {
			trailing: true
		}
	};
}
