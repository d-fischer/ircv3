import Connection from './Connection';

import { Socket } from 'net';
import * as tls from 'tls';

class DirectConnection extends Connection {
	private _socket?: Socket;

	async connect() {
		return new Promise<void>((resolve, reject) => {
			const connectionErrorListener = (err: Error) => {
				this.emit('disconnect', err);
				if (!this._connected) {
					reject(err);
				}
			};
			const connectionListener = () => {
				this._connected = true;
				this.emit('connect');
				resolve();
			};
			if (this._secure) {
				this._socket = tls.connect(this._port || 6697, this._host, connectionListener);
			} else {
				this._socket = new Socket();
				this._socket.connect(this._port || 6667, this._host, connectionListener);
			}
			this._socket.on('error', connectionErrorListener);
			this._socket.on('data', (data: Buffer) => {
				this.receiveRaw(data.toString());
			});
			this._socket.on('close', (hadError: boolean) => {
				this._socket = undefined;
				if (!hadError) {
					this.emit('disconnect');
				}
			});
		});
	}

	disconnect() {
		if (this._socket) {
			this._socket.destroy();
		}
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.write(line);
		}
	}
}

export default DirectConnection;
