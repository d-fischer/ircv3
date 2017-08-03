import Connection from './Connection';

import { Socket } from 'net';
import * as tls from 'tls';

class DirectConnection extends Connection {
	private _socket?: Socket;

	connect() {
		const connectionListener = () => {
			this._connected = true;
			this.emit('connected');
		};
		if (this._secure) {
			this._socket = tls.connect(this._port || 6697, this._host, connectionListener);
		} else {
			this._socket = new Socket();
			this._socket.connect(this._port || 6667, this._host, connectionListener);
		}
		this._socket.on('data', (data: Buffer) => {
			this.receiveRaw(data.toString());
		});
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.write(line);
		}
	}
}

export default DirectConnection;
