import { ReadonlySignal } from "../signal"

export declare interface ReadonlyWatchable<T> {
    readonly value: T
    getValue(): T
    update: ReadonlySignal<T>
}

export declare class Watchable<T> {
    static fromInput<T extends string>(target: HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement): ReadonlyWatchable<T>
    constructor(value: T);
    value: T
    setValue(value: T): void
    getValue(): T
    update: ReadonlySignal<T>
}