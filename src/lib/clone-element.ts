export function cloneElement<T extends Node>(source: T) {
    return source.cloneNode(true) as T
}