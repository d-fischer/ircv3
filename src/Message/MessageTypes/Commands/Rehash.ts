import { Message } from '../../Message';
import { MessageType } from '../../MessageDefinition';

@MessageType('REHASH')
export class Rehash extends Message {}
