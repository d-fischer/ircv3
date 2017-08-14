import Connection from './Connection';
import * as WebSocket from 'ws';

class WebSocketConnection extends Connection {
	private _socket?: WebSocket;

	async connect() {
		return new Promise<void>((resolve, reject) => {
			const url = `ws${this._secure ? 's' : ''}://${this._host}:${this._port || (this._secure ? 443 : 80)}`;
			this._socket = new WebSocket(url);
			this._socket.on('open', () => {
				this._connected = true;
				this.emit('connect');
				resolve();
			});
			this._socket.on('message', (line: string) => {
				this.receiveRaw(line);
			});
			this._socket.onclose = ({wasClean, code, reason}) => {
				this._socket = undefined;
				if (wasClean) {
					this.emit('disconnect');
				} else {
					this.emit('disconnect', new Error(`[${code}] ${reason}`));
					if (!this._connected) {
						reject();
					}
				}
			};
		});
	}

	disconnect() {
		if (this._socket) {
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
