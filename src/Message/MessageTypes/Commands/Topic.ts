import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface TopicParams {
	channel: MessageParam;
	newTopic: MessageParam;
}

export default class Topic extends Message<TopicParams> {
	static readonly COMMAND = 'TOPIC';
	static readonly PARAM_SPEC: MessageParamSpec<Topic> = {
		channel: {
			type: 'channel'
		},
		newTopic: {
			optional: true,
			trailing: true
		}
	};
}
