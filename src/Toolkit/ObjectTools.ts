export default class ObjectTools {
	static map<Obj, T, O>(obj: Obj, fn: (value: T, key: keyof Obj) => O): { [name in keyof Obj]: O } {
		const mapped = Object.entries(obj).map(([key, value]: [keyof Obj, T]) => ({[key]: fn(value, key)}));
		return Object.assign({}, ...mapped) as { [name in keyof Obj]: O };
	}

	static forEach<Obj, T>(obj: Obj, fn: (value: T, key: keyof Obj) => void): void {
		Object.entries(obj).forEach(([key, value]: [keyof Obj, T]) => fn(value, key));
	}
}
