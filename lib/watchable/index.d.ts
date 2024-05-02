import { ReadonlySignal } from "../signal"

export declare interface ReadonlyWatchable<T> {
    readonly value: T
    getValue(): T
    update: ReadonlySignal<T>
}

export declare class Watchable<T> {
    static fromInput<T extends string>(
        target: HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement,
        ofType?: (it: unknown) => it is T
    ): ReadonlyWatchable<T>
    constructor(value: T, ofType?: (it: unknown) => it is T);
    value: T
    setValue(value: T): void
    getValue(): T
    update: ReadonlySignal<T>
}