import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Reply333TopicWhoTimeParams {
	me: MessageParam;
	channel: MessageParam;
	who: MessageParam;
	ts: MessageParam;
}

export default class Reply333TopicWhoTime extends Message<Reply333TopicWhoTimeParams> {
	static readonly COMMAND = '333';
	static readonly PARAM_SPEC: MessageParamSpec<Reply333TopicWhoTime> = {
		me: {},
		channel: {
			type: 'channel'
		},
		who: {},
		ts: {}
	};
}
