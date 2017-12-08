import Connection from './Connection';
import * as WebSocket from 'ws';

class WebSocketConnection extends Connection {
	private _socket?: WebSocket;

	async connect() {
		return new Promise<void>((resolve, reject) => {
			this._connecting = true;
			const url = `ws${this._secure ? 's' : ''}://${this._host}:${this._port || (this._secure ? 443 : 80)}`;
			this._socket = new WebSocket(url);

			// I don't like this, but it works
			if (typeof this._socket.on === 'undefined') {
				this._socket.on = this._socket.addEventListener;
			}

			this._socket.on('open', () => {
				this._connected = true;
				this._connecting = false;
				this.emit('connect');
				this._initialConnection = false;
				resolve();
			});
			this._socket.on('message', (line: string) => {
				// I also don't loke this
				this.receiveRaw(typeof line === 'string' ? line : line.data);
			});
			this._socket.onclose = ({ wasClean, code, reason }) => {
				this._socket = undefined;
				this._connected = false;
				this._connecting = false;
				if (wasClean) {
					this.emit('disconnect');
				} else {
					this.emit('disconnect', new Error(`[${code}] ${reason}`));
					if (this._initialConnection) {
						reject();
					}
				}
			};
		});
	}

	disconnect() {
		if (this._socket) {
			this._manualDisconnect = true;
			this._socket.close();
		}
	}

	sendRaw(line: string) {
		if (this._socket) {
			this._socket.send(line);
		}
	}
}

export default WebSocketConnection;
