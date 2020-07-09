import { Message } from '../../Message';
import { MessageType } from '../../MessageDefinition';

@MessageType('RESTART')
export class Restart extends Message {}
