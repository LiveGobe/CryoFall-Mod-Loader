
export function querySelector<T extends Element>(document: { querySelector(selector: string): Element | null }, selector: string, constructor: new (...args: any[]) => T): T
export function querySelector(document: { querySelector(selector: string): Element | null }, selector: string): HTMLElement
export function querySelector(document: { querySelector(selector: string): Element | null }, selector: string, constructor?: new (...args: any[]) => any) {
    const out = document.querySelector(selector)
    if (!out) {
        throw new Error(`element with selector "${selector}" not found`)
    }
    if (typeof constructor !== 'function' || out instanceof constructor) {
        return out
    }
    throw new Error(`element type missmatch '${selector}': expected ${constructor.name} got ${out.constructor.name}`)
}