import Connection from './Connection';

import { Socket } from 'net';
import * as tls from 'tls';

class DirectConnection extends Connection {
	private _socket?: Socket;

	get port() {
		return this._port || (this._secure ? 6697 : 6667);
	}

	async doConnect() {
		return new Promise<void>((resolve, reject) => {
			this._connecting = true;
			const connectionErrorListener = (err: Error) => {
				if (this._socket) {
					this._socket.destroy();
					this._socket = undefined;
				}
				this._connected = false;
				this._connecting = false;
				this.emit('doDisconnect', err);
				this._handleReconnect(err);
				if (this._initialConnection) {
					reject(err);
				}
			};
			const connectionListener = () => {
				this._connecting = false;
				this._connected = true;
				this.emit('connect');
				this._initialConnection = false;
				resolve();
			};
			if (this._secure) {
				this._socket = tls.connect(this.port, this._host, {}, connectionListener);
			} else {
				this._socket = new Socket();
				this._socket.connect(this.port, this._host, connectionListener);
			}
			this._socket.on('error', connectionErrorListener);
			this._socket.on('data', (data: Buffer) => {
				this.receiveRaw(data.toString());
			});
			this._socket.on('close', (hadError: boolean) => {
				if (!hadError) {
					if (this._socket) {
						this._socket.destroy();
						this._socket = undefined;
					}
					this._connected = false;
					this._connecting = false;
					this.emit('disconnect');
					this._handleReconnect();
				}
			});
		});
	}

	doDisconnect() {
		if (this._socket) {
			this._manualDisconnect = true;
			this._socket.destroy();
			this._socket = undefined;
		}
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.write(line);
		}
	}
}

export default DirectConnection;
