import Message, {MessageParam, MessageParamSpec} from '../../Message';
import {Numeric353NamesReply, Numeric366EndOfNames} from '../Numerics';

export interface NamesParams {
	channel: MessageParam;
}

export default class Names extends Message<NamesParams> {
	public static readonly COMMAND = 'NAMES';
	public static readonly PARAM_SPEC: MessageParamSpec<NamesParams> = {
		channel: {
			type: 'channel',
			optional: true
		}
	};

	public async send(): Promise<Message[]> {
		const promise = this._client.intercept(this, Numeric353NamesReply).untilType(Numeric366EndOfNames).promise();
		await super.send();
		return await promise;
	}
}
