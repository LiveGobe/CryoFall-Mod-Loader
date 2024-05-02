
export declare function getElementById<T extends Element>(document: { getElementById(id: string): Element | null }, id: string, constructor: new (...args: any[]) => T): T
export declare function getElementById(document: { getElementById(id: string): Element | null }, id: string): HTMLElement

export declare function querySelector<T extends Element>(document: { querySelector(selector: string): Element | null }, selector: string, constructor: new (...args: any[]) => T): T
export declare function querySelector(document: { querySelector(selector: string): Element | null }, selector: string): HTMLElement

export declare function cloneElement(target: Element | DocumentFragment): Element