export function isInstanceOf<T extends new (...args: any[]) => any>(constructor: T) {
    return (it: unknown): it is InstanceType<T> => it instanceof constructor
}