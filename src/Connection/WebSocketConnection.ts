import Connection from './Connection';
import * as WebSocket from 'ws';

class WebSocketConnection extends Connection {
	private _socket?: WebSocket;

	connect() {
		this._socket = new WebSocket(`ws://${this._host}:${this._port || 80}`);
		this._socket.on('open', () => {
			this._connected = true;
			this.emit('connected');
		});
		this._socket.on('message', (line: string) => {
			this.receiveRaw(line);
		});
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.send(line);
		}
	}
}

export default WebSocketConnection;
