export default class ObjectTools {
	static map<Obj, T, O>(obj: Obj, fn: (input: T) => O): { [name in keyof Obj]: O } {
		const mapped = Object.entries(obj).map(([key, value]) => ({[key]: fn(value)}));
		return Object.assign({}, ...mapped) as { [name in keyof Obj]: O };
	}
}
