import Message, {MessageParam, MessageParamSpec} from '../../Message';

export interface Numeric005ISupportParams {
	nick: MessageParam;
	supports: MessageParam;
	suffix: MessageParam;
}

export default class Numeric005ISupport extends Message<Numeric005ISupportParams> {
	public static readonly COMMAND = '005';
	public static readonly PARAM_SPEC: MessageParamSpec<Numeric005ISupportParams> = {
		nick: {},
		supports: {
			rest: true
		},
		suffix: {
			trailing: true
		}
	};
}
