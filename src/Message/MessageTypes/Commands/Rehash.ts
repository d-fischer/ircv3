import Message from '../../Message';
import { MessageType } from '../../MessageDefinition';

@MessageType('REHASH')
export default class Rehash extends Message {}
