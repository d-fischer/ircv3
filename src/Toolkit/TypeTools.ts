export type Omit<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type FilterFlags<Base, Condition> = {
	[Key in Extract<keyof Base, string>]:
	Base[Key] extends Condition ? Key : never
};

type AllowedNames<Base, Condition> =
	FilterFlags<Base, Condition>[Extract<keyof Base, string>];

export type PickType<Base, Condition> =
	Record<AllowedNames<Base, Condition>, Condition>;

// tslint:disable-next-line:no-any
export type ConstructedType<C> = C extends new(...params: any[]) => infer T ? T : never;
