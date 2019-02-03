import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply331NoTopicParams {
	me: MessageParam;
	channel: MessageParam;
	suffix: MessageParam;
}

export default class Reply331NoTopic extends Message<Reply331NoTopicParams> {
	static readonly COMMAND = '331';
	static readonly PARAM_SPEC: MessageParamSpec<Reply331NoTopic> = {
		me: {},
		channel: {
			type: 'channel'
		},
		suffix: {
			trailing: true
		}
	};
}
