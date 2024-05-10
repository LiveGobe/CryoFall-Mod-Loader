
export function getElementById<T extends Element>(document: { getElementById(id: string): Element | null }, id: string, constructor: new (...args: any[]) => T): T
export function getElementById(document: { getElementById(id: string): Element | null }, id: string): HTMLElement
export function getElementById(document: { getElementById(id: string): Element | null }, id: string, constructor?: new (...args: any[]) => any) {
    const out = document.getElementById(id)
    if (!out) {
        throw new Error(`element with id "#${id}" not found`)
    }
    if (typeof constructor !== 'function' || out instanceof constructor) {
        return out
    }
    throw new Error(`element type missmatch #${id}: expected ${constructor.name} got ${out.constructor.name}`)
}