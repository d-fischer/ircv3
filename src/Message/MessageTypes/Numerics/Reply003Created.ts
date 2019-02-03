import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply003CreatedParams {
	me: MessageParam;
	createdText: MessageParam;
}

export default class Reply003Created extends Message<Reply003CreatedParams> {
	static readonly COMMAND = '003';
	static readonly PARAM_SPEC: MessageParamSpec<Reply003Created> = {
		me: {},
		createdText: {
			trailing: true
		}
	};
}
