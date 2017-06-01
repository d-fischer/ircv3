import Connection from './Connection';
import {Socket} from 'net';

class DirectConnection extends Connection {
	private _socket?: Socket;

	connect() {
		this._socket = new Socket();
		this._socket.on('data', (data: Buffer) => {
			this.receiveRaw(data.toString().trim());
		});
		this._socket.connect(this._port, this._host, () => {
			this._connected = true;
			this.register();
		});
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.write(line);
		}
	}
}

export default DirectConnection;
