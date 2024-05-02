// @ts-check

export function getElementById(id) {
    const out = document.getElementById(id)
    if (!out) {
        throw new Error(`element with id "#${id}" not found`)
    }
    return out
}

export function getElementByIdOfType(id, ofType) {
    const out = getElementById(id)
    if (ofType(out)) {
        return out
    }
    throw new Error(`element type missmatch: got ${out.constructor.name}`)
}
