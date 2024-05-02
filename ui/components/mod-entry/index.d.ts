export declare interface ModeEntryData {
    readonly author: string
    readonly id: string
    readonly title: string
    readonly version: string
    readonly description: string
    readonly enabled: boolean
}

export declare class ModEntryTemplate {
    constructor(tempalteId: string)
    create(data: ModEntryData): ModEntryComponent
}

export declare class ModEntryComponent {
    constructor(root: HTMLElement)
    mount(target: Node): void
    update(data: ModEntryData): void
    unmount(): void
}