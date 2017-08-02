import Connection from './Connection';

import { Socket } from 'net';

class DirectConnection extends Connection {
	private _socket?: Socket;

	connect() {
		this._socket = new Socket();
		this._socket.on('data', (data: Buffer) => {
			this.receiveRaw(data.toString());
		});
		this._socket.connect(this._port || 6667, this._host, () => {
			this._connected = true;
			this.emit('connected');
		});
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.write(line);
		}
	}
}

export default DirectConnection;
