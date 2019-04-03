import Message from '../../Message';
import { MessageType } from '../../MessageDefinition';

@MessageType('RESTART')
export default class Restart extends Message {}
