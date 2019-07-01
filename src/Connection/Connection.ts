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
	protected _initialConnection: boolean = true;
	protected _shouldReconnect: boolean = true;
	protected _manualDisconnect: boolean = false;

	private _retryDelayGenerator?: IterableIterator<number>;
	private _retryTimer?: NodeJS.Timer;

	private _currentLine = '';

	protected abstract async doConnect(): Promise<void>;
	protected abstract doDisconnect(): void;

	protected abstract sendRaw(line: string): void;
	abstract get port(): number;

	constructor({ hostName, port, secure, reconnect = true }: ConnectionInfo) {
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

		this._shouldReconnect = reconnect;

		this.on('connect', () => {
			this._retryDelayGenerator = undefined;
		});
	}

	protected _handleReconnect(error?: Error) {
		if (this._manualDisconnect) {
			this._manualDisconnect = false;
		} else if (error && this._shouldReconnect) {
			// tslint:disable-next-line:no-floating-promises
			if (!this._retryDelayGenerator) {
				this._retryDelayGenerator = Connection._getReconnectWaitTime();
			}
			const delay = this._retryDelayGenerator.next().value;
			this._retryTimer = setTimeout(async () => this.connect(), delay * 1000);
		}
	}

	async connect() {
		return this.doConnect();
	}

	disconnect() {
		if (this._retryTimer) {
			clearInterval(this._retryTimer);
		}
		this._retryDelayGenerator = undefined;
		this.doDisconnect();
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

	// yes, this is just fibonacci with a limit
	private static * _getReconnectWaitTime(): IterableIterator<number> {
		let current = 0;
		let next = 1;

		while (current < 120) {
			yield current;
			[current, next] = [next, current + next];
		}

		while (true) {
			yield 120;
		}
	}
}

export default Connection;
