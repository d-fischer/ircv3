import { Message } from '../../../../../Message/Message';
import { MessageType } from '../../../../../Message/MessageDefinition';

@MessageType('ACK')
export class Acknowledgement extends Message<Acknowledgement> {}
