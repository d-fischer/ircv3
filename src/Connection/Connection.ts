import {sanitizeParameter as sanitize} from '../Toolkit/StringTools';

export interface ConnectionInfo {
	hostName: string;
	port?: number;
	nick: string;
	password?: string;
	userName?: string;
	realName?: string;
}

abstract class Connection {
	protected _host: string;
	protected _port: number = 6667;
	protected _nick: string;
	protected _password?: string;
	protected _userName: string;
	protected _realName: string;
	protected _connected: boolean = false;

	public abstract connect(): void;

	protected abstract sendRaw(line: string): void;

	constructor({hostName, port, nick, password, userName, realName}: ConnectionInfo) {
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
			this._port = Number(splitPort) || 6667;
		}
		this._nick = nick;
		this._password = password;
		this._userName = userName || nick;
		this._realName = realName || nick;
	}

	sendLine(line: string): void {
		if (this._connected) {
			line = line.replace(/[\0\r\n]/g, '');
			this.sendRaw(line + '\r\n');
			// tslint:disable-next-line:no-console
			console.log(`< send: ${line}`);
		}
	}

	register(): void {
		if (this._password) {
			this.sendLine(`PASS ${sanitize(this._password)}`);
		}
		this.sendLine(`NICK ${sanitize(this._nick)}`);
		this.sendLine(`USER ${sanitize(this._userName)} 8 * :${sanitize(this._realName, true)}`);
	}

	receiveRaw(line: string) {
		// tslint:disable-next-line:no-console
		console.log(`> recv: ${line}`);
	}
}

export default Connection;
