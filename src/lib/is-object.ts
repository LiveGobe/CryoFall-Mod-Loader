export function isObject<T extends {}>(it: unknown): it is T {
    return typeof it === 'object' && it != null
}