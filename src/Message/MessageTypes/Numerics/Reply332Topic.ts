import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply332TopicParams {
	me: MessageParam;
	channel: MessageParam;
	topic: MessageParam;
}

export default class Reply332Topic extends Message<Reply332TopicParams> {
	static readonly COMMAND = '332';
	static readonly PARAM_SPEC: MessageParamSpec<Reply332Topic> = {
		me: {},
		channel: {
			type: 'channel'
		},
		topic: {
			trailing: true
		}
	};
}
