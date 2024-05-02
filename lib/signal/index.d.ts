
export interface ReadonlySignal<T> {
    listen(listener: (data: T) => void): void
    listenOnce(listener: (data: T) => void): void
    unlisten(listener: (data: T) => void): void
    unlistenAll(): void
}

export interface Signal<T> extends ReadonlySignal<T> {
    (data: T): void
}

export declare function createSignal<T>(): Signal<T>