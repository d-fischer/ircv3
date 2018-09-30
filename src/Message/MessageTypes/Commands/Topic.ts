import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface TopicParams {
	channel: MessageParam;
	newTopic: MessageParam;
}

export default class Topic extends Message<TopicParams> {
	public static readonly COMMAND = 'TOPIC';
	public static readonly PARAM_SPEC: MessageParamSpec<Topic> = {
		channel: {
			type: 'channel'
		},
		newTopic: {
			optional: true,
			trailing: true
		}
	};
}
