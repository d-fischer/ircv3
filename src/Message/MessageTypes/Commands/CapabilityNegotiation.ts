import Message, { MessageParam } from '../../Message';
import { MessageParamDefinition, MessageType } from '../../MessageDefinition';

@MessageType('CAP')
export default class CapabilityNegotiation extends Message<CapabilityNegotiation> {
	@MessageParamDefinition({
		match: /^(?:[a-z_\-\[\]\\^{}|`][a-z0-9_\-\[\]\\^{}|`]+|\*)$/i,
		optional: true,
		noClient: true
	})
	target!: MessageParam;

	@MessageParamDefinition({
		match: /^(?:LS|LIST|REQ|ACK|NAK|END|NEW|DEL)$/i
	})
	subCommand!: MessageParam;

	@MessageParamDefinition({
		match: /^\d+$/,
		optional: true
	})
	version!: MessageParam;

	@MessageParamDefinition({
		match: /^\*$/,
		optional: true
	})
	continued!: MessageParam;

	@MessageParamDefinition({
		trailing: true,
		optional: true
	})
	capabilities!: MessageParam;

	static readonly SUPPORTS_CAPTURE = true;

	protected isResponseTo(originalMessage: Message): boolean {
		if (!(originalMessage instanceof CapabilityNegotiation)) {
			return false;
		}

		switch (this.params.subCommand) {
			case 'ACK':
			case 'NAK': {
				// trim is necessary because some networks seem to add trailing spaces (looking at you, Freenode)...
				return originalMessage.params.subCommand === 'REQ'
					&& originalMessage.params.capabilities === this.params.capabilities.trim();
			}

			case 'LS':
			case 'LIST': {
				return originalMessage.params.subCommand === this.params.subCommand;
			}

			default: {
				return false;
			}
		}
	}

	endsResponseTo(originalMessage: Message): boolean {
		if (!(originalMessage instanceof CapabilityNegotiation)) {
			return false;
		}

		switch (this.params.subCommand) {
			case 'LS':
			case 'LIST': {
				return !this.params.continued;
			}

			default: {
				return true;
			}
		}
	}
}
