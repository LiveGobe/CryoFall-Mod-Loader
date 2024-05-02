export function isInstanceOf(constructor) {
    return (it) => it instanceof constructor
}

export function isOneOf(values) {
    return (it) => values.includes(it)
}