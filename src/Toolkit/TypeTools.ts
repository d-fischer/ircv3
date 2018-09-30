import Message from '../Message/Message';

export type MessageDataType<T> = T extends Message<infer D> ? D : never;
export type MessageParams<T> = {
	[name in keyof MessageDataType<T>]?: string;
};
