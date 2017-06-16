import Message, {MessageParam, MessageParamSpec, MessagePrefix} from '../../Message';
import {isChannel} from '../../../Toolkit/StringTools';

export interface ModeParams {
	target: MessageParam;
	modes: MessageParam;
}

export type ModeAction = 'getList' | 'add' | 'remove';

export interface SingleMode {
	prefix?: MessagePrefix;
	action: ModeAction;
	mode: string;
	param?: string;
}

export default class Mode extends Message<ModeParams> {
	public static readonly COMMAND = 'MODE';
	public static readonly PARAM_SPEC: MessageParamSpec<ModeParams> = {
		target: {},
		modes: {
			rest: true,
			optional: true
		}
	};

	public get isChannel() {
		return isChannel(this._parsedParams.target.value, this._client.channelTypes);
	}

	public separate(): SingleMode[] {
		let result: SingleMode[] = [];
		const modeRestParam = this._parsedParams.modes;
		if (!modeRestParam) {
			throw new Error('can\'t separate a channel mode request, just set actions');
		}
		let modeParams = modeRestParam.value.split(' ');
		const modes = modeParams.shift();
		if (!modes) {
			throw new Error('this should never happen because of the error condition above');
		}
		let currentModeAction: ModeAction = 'add';
		for (let ch of modes) {
			let thisModeAction: ModeAction = currentModeAction;
			switch (ch) {
				case '+': {
					currentModeAction = 'add';
					break;
				}
				case '-': {
					currentModeAction = 'remove';
					break;
				}
				default: {
					let requiresParam = false;
					if (this.isChannel) {
						if (this._client.supportedChannelModes.alwaysWithParam.includes(ch)) {
							requiresParam = true;
						} else if (this._client.supportedChannelModes.paramWhenSet.includes(ch)) {
							if (currentModeAction === 'add') {
								requiresParam = true;
							}
						} else if (this._client.supportedChannelModes.list.includes(ch)) {
							if (modeParams.length) {
								requiresParam = true;
							} else {
								thisModeAction = 'getList';
							}
						} else if (this._client.supportedChannelModes.noParam.includes(ch)) {
							// whatever
						} else {
							throw new Error(`unknown mode character: ${ch}`);
						}
					}
					if (requiresParam && !modeParams.length) {
						throw new Error(`mode parameter underflow`);
					}
					result.push({
						prefix: this._prefix,
						action: thisModeAction,
						mode: ch,
						param: requiresParam ? modeParams.shift() : undefined
					});
				}
			}
		}

		return result;
	}
}
