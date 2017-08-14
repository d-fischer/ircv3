import { EventEmitter } from 'events';

export interface ConnectionInfo {
	hostName: string;
	port?: number;
	nick: string;
	password?: string;
	userName?: string;
	realName?: string;
	secure?: boolean;
}

abstract class Connection extends EventEmitter {
	protected _host: string;
	protected _port?: number;
	protected _secure: boolean;
	protected _connected: boolean = false;
	private _currentLine = '';

	public abstract async connect(): Promise<void>;
	public abstract disconnect(): void;

	protected abstract sendRaw(line: string): void;

	constructor({hostName, port, secure}: ConnectionInfo) {
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
	}

	sendLine(line: string): void {
		if (this._connected) {
			line = line.replace(/[\0\r\n]/g, '');
			this.sendRaw(line + '\r\n');
			// tslint:disable-next-line:no-console
			console.log(`< send: \`${line}\``);
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
}

export default Connection;
