// @ts-check

export function getElementById(document, id, constructor) {
    const out = document.getElementById(id)
    if (!out) {
        throw new Error(`element with id "#${id}" not found`)
    }
    if (typeof constructor !== 'function' || out instanceof constructor) {
        return out
    }
    throw new Error(`element type missmatch #${id}: expected ${constructor.name} got ${out.constructor.name}`)
}

export function querySelector(document, selector, constructor) {
    const out = document.querySelector(selector)
    if (!out) {
        throw new Error(`element with selector "${selector}" not found`)
    }
    if (typeof constructor !== 'function' || out instanceof constructor) {
        return out
    }
    throw new Error(`element type missmatch '${selector}': expected ${constructor.name} got ${out.constructor.name}`)
}

export function cloneElement(source) {
    return source.cloneNode(true)
}
