// @ts-check

export function getElementByIdOfType(id, ofType) {
    const out = document.getElementById(id)
    if (!out) {
        throw new Error(`element with id "#${id}" not found`)
    }
    if (ofType(out)) {
        return out
    }
    throw new Error(`element type missmatch: got ${out.constructor.name}`)
}