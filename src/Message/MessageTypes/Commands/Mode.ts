import Message, { MessageParam, MessageParamSpec, MessagePrefix } from '../../Message';
import { isChannel } from '../../../Toolkit/StringTools';

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
	static readonly COMMAND = 'MODE';
	static readonly PARAM_SPEC: MessageParamSpec<Mode> = {
		target: {},
		modes: {
			rest: true,
			optional: true
		}
	};

	get isChannel() {
		return isChannel(this._parsedParams.target.value, this._serverProperties.channelTypes);
	}

	separate(): SingleMode[] {
		const result: SingleMode[] = [];
		const modeRestParam = this._parsedParams.modes;
		if (!modeRestParam) {
			throw new Error('can\'t separate a channel mode request, just set actions');
		}
		const modeParams = modeRestParam.value.split(' ');
		const modes = modeParams.shift()!;
		let currentModeAction: ModeAction = 'add';
		for (const ch of modes) {
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
						if (this._serverProperties.supportedChannelModes.alwaysWithParam.includes(ch)) {
							requiresParam = true;
						} else if (this._serverProperties.supportedChannelModes.paramWhenSet.includes(ch)) {
							if (currentModeAction === 'add') {
								requiresParam = true;
							}
						} else if (this._serverProperties.supportedChannelModes.list.includes(ch)) {
							if (modeParams.length) {
								requiresParam = true;
							} else {
								thisModeAction = 'getList';
							}
						} else if (this._serverProperties.supportedChannelModes.noParam.includes(ch)) {
							// whatever
						} else {
							throw new Error(`unknown mode character: ${ch}`);
						}
					}
					if (requiresParam && !modeParams.length) {
						throw new Error('mode parameter underflow');
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
