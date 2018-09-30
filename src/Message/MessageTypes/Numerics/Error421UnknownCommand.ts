import Message, { MessageParam, MessageParamSpec } from '../../Message';

export interface Error421UnknownCommandParams {
	me: MessageParam;
	command: MessageParam;
	suffix: MessageParam;
}

export default class Error421UnknownCommand extends Message<Error421UnknownCommandParams> {
	static readonly COMMAND = '421';
	static readonly PARAM_SPEC: MessageParamSpec<Error421UnknownCommand> = {
		me: {},
		command: {},
		suffix: {
			trailing: true
		}
	};

	protected isResponseTo(originalMessage: Message) {
		return originalMessage.command === this.params.command;
	}

	endsResponseTo(originalMessage: Message) {
		return true;
	}
}
