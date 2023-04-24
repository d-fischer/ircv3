import { Message, type MessageInternalConfig, type MessageInternalContents } from '../../Message';

interface CapabilityNegotiationFields {
	target?: string;
	subCommand: string;
	version?: string;
	continued?: string;
	capabilities?: string;
}

export interface CapabilityNegotiation extends CapabilityNegotiationFields {}
export class CapabilityNegotiation extends Message<CapabilityNegotiationFields> {
	static readonly COMMAND = 'CAP';
	static readonly SUPPORTS_CAPTURE = true;

	constructor(command: string, contents?: MessageInternalContents, config?: MessageInternalConfig) {
		super(command, contents, config, {
			target: {
				match: /^(?:[a-z_\-\[\]\\^{}|`][a-z0-9_\-\[\]\\^{}|`]+|\*)$/i,
				optional: true,
				noClient: true
			},
			subCommand: { match: /^(?:LS|LIST|REQ|ACK|NAK|END|NEW|DEL)$/i },
			version: { match: /^\d+$/, optional: true },
			continued: { match: /^\*$/, optional: true },
			capabilities: { trailing: true, optional: true }
		});
	}

	isResponseTo(originalMessage: Message): boolean {
		if (!(originalMessage instanceof CapabilityNegotiation)) {
			return false;
		}

		switch (this.subCommand) {
			case 'ACK':
			case 'NAK': {
				// trim is necessary because some networks seem to add trailing spaces (looking at you, Freenode)...
				return (
					originalMessage.subCommand === 'REQ' && originalMessage.capabilities === this.capabilities!.trim()
				);
			}

			case 'LS':
			case 'LIST': {
				return originalMessage.subCommand === this.subCommand;
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

		switch (this.subCommand) {
			case 'LS':
			case 'LIST': {
				return !this.continued;
			}

			default: {
				return true;
			}
		}
	}
}
