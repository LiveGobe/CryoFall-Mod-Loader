export function isString<T extends string>(it: unknown): it is T {
    return typeof it === 'string'
}