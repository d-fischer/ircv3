import { EventEmitter } from 'events';

export interface ConnectionInfo {
	hostName: string;
	port?: number;
	secure?: boolean;
	reconnect?: boolean;
	pingOnInactivity?: number;
	pingTimeout?: number;
}

abstract class Connection extends EventEmitter {
	protected _host: string;
	protected _port?: number;
	protected _secure: boolean;
	protected _connecting: boolean = false;
	protected _connected: boolean = false;
	protected _manualDisconnect: boolean = false;

	private _currentLine = '';

	constructor({ hostName, port, secure }: ConnectionInfo) {
		super();
		this._secure = Boolean(secure);
		if (port) {
			this._host = hostName;
			this._port = port;
		} else {
			const splitHost = hostName.split(':');
			if (splitHost.length > 2) {
				throw new Error('malformed hostName');
			}
			const [host, splitPort] = splitHost;
			this._host = host;
			if (splitPort) {
				this._port = Number(splitPort);
			}
		}
	}

	async connect() {
		return this.doConnect();
	}

	disconnect(manually = true) {
		if (this.hasSocket && manually) {
			this._manualDisconnect = true;
		}
	}

	destroy() {
		this.removeAllListeners();
	}

	sendLine(line: string): void {
		if (this._connected) {
			line = line.replace(/[\0\r\n]/g, '');
			this.sendRaw(`${line}\r\n`);
		}
	}

	receiveRaw(data: string) {
		const receivedLines = data.split('\r\n');
		this._currentLine += receivedLines.shift() || '';
		if (receivedLines.length) {
			this.emit('lineReceived', this._currentLine);
			this._currentLine = receivedLines.pop() || '';
			for (const line of receivedLines) {
				this.emit('lineReceived', line);
			}
		}
	}

	get isConnecting() {
		return this._connecting;
	}

	get isConnected() {
		return this._connected;
	}

	get host() {
		return this._host;
	}

	protected _handleDisconnect(error?: Error) {
		this.emit('disconnect', this._manualDisconnect, error);
		if (this._manualDisconnect) {
			this._manualDisconnect = false;
		}
		this.destroy();
	}

	protected abstract async doConnect(): Promise<void>;

	protected abstract sendRaw(line: string): void;

	abstract get hasSocket(): boolean;
	abstract get port(): number;
}

export default Connection;
