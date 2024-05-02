export declare function isInstanceOf<T extends new (...args: any[]) => any>(constructor: T): (it: unknown) => it is InstanceType<T>
export declare function isOneOf<T extends string>(values: readonly T[]): (it: unknown) => it is T
export declare function isOneOf<T>(values: readonly T[]): (it: unknown) => it is T