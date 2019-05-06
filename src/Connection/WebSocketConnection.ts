import Connection from './Connection';
import * as WebSocket from 'universal-websocket-client';

class WebSocketConnection extends Connection {
	private _socket?: WebSocket;

	get port() {
		return this._port || (this._secure ? 443 : 80);
	}

	async connect() {
		return new Promise<void>((resolve, reject) => {
			this._connecting = true;
			const url = `ws${this._secure ? 's' : ''}://${this._host}:${this.port}`;
			this._socket = new WebSocket(url);

			this._socket.onopen = () => {
				this._connected = true;
				this._connecting = false;
				this.emit('connect');
				this._initialConnection = false;
				resolve();
			};

			this._socket.onmessage = ({ data }: {data: WebSocket.Data}) => {
				this.receiveRaw(data.toString());
			};

			// The following empty error callback needs to exist so connection errors are passed down to `onclose` down below - otherwise the process just crashes instead
			// tslint:disable-next-line
			this._socket.onerror = () => {};

			this._socket.onclose = ({ wasClean, code, reason }) => {
				this._socket = undefined;
				this._connected = false;
				this._connecting = false;
				if (wasClean) {
					this.emit('disconnect');
					this._handleReconnect();
				} else {
					const err = new Error(`[${code}] ${reason}`);
					this.emit('disconnect', err);
					this._handleReconnect(err);
					if (this._initialConnection) {
						reject(err);
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
