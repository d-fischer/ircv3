import { Message } from '../../../../../Message/Message';

export class Acknowledgement extends Message {
	static readonly COMMAND = 'ACK';
}
