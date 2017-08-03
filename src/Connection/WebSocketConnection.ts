import Connection from './Connection';
import * as WebSocket from 'ws';

class WebSocketConnection extends Connection {
	private _socket?: WebSocket;

	connect() {
		const url = `ws${this._secure ? 's' : ''}://${this._host}:${this._port || (this._secure ? 443 : 80)}`;
		this._socket = new WebSocket(url);
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
