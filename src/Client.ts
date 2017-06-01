import Connection, {ConnectionInfo} from './Connection/Connection';
import WebSocketConnection from './Connection/WebSocketConnection';
import DirectConnection from './Connection/DirectConnection';

export default class Client {
	public _connection: Connection;

	constructor({connection, webSocket}: { connection: ConnectionInfo, webSocket?: boolean }) {
		if (webSocket) {
			this._connection = new WebSocketConnection(connection);
		} else {
			this._connection = new DirectConnection(connection);
		}
	}
}
