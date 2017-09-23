import { EventEmitter } from 'events';

export interface ConnectionInfo {
	hostName: string;
	port?: number;
	nick: string;
	password?: string;
	userName?: string;
	realName?: string;
	secure?: boolean;
	reconnect?: boolean;
}

abstract class Connection extends EventEmitter {
	protected _host: string;
	protected _port?: number;
	protected _secure: boolean;
	protected _connecting: boolean = false;
	protected _connected: boolean = false;
	protected _initialConnection: boolean = true;
	protected _shouldReconnect: boolean = true;
	protected _manualDisconnect: boolean = false;

	private _currentLine = '';

	public abstract async connect(): Promise<void>;
	public abstract disconnect(): void;

	protected abstract sendRaw(line: string): void;

	constructor({hostName, port, secure, reconnect = true}: ConnectionInfo) {
		super();
		this._secure = Boolean(secure);
		if (port) {
			this._host = hostName;
			this._port = port;
		} else {
			let splitHost = hostName.split(':');
			if (splitHost.length > 2) {
				throw new Error('malformed hostName');
			}
			let [host, splitPort] = splitHost;
			this._host = host;
			this._port = Number(splitPort);
		}

		this._shouldReconnect = reconnect;
		this.on('disconnect', error => {
			if (this._manualDisconnect) {
				this._manualDisconnect = false;
			} else if (error && this._shouldReconnect) {
				this.connect();
			}
		});
	}

	sendLine(line: string): void {
		if (this._connected) {
			line = line.replace(/[\0\r\n]/g, '');
			this.sendRaw(line + '\r\n');
		}
	}

	receiveRaw(data: string) {
		let receivedLines = data.split('\r\n');
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
}

export default Connection;
