import Connection from './Connection';
import * as WebSocket from 'ws';

class WebSocketConnection extends Connection {
	private _socket?: WebSocket;

	connect() {
		this._socket = new WebSocket(`ws://${this._host}:${this._port}`);
		this._socket.on('open', () => {
			this._connected = true;
			this.register();
		});
		this._socket.on('message', (line, {binary}: {binary: boolean}) => {
			if (binary) {
				// no idea what to do if an IRC server sends binary data...
				return;
			}

			this.receiveRaw(line.trim());
		});
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.send(line);
		}
	}
}

export default WebSocketConnection;
