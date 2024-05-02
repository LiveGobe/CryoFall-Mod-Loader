declare type ModeType =
    | 'client'
    | 'server'
    | 'editor'

declare type MutationSuccessResult = {
    readonly success: true
    readonly errmsg?: undefined
}
declare type MutationFailureResult = {
    readonly success: false
    readonly errmsg: string
}
declare type MutationResult =
    | MutationFailureResult
    | MutationSuccessResult

declare const config: {
    load(): {
        readonly folderpaths: {
            readonly client: string
            readonly editor: string
            readonly server: string
        }
    }
    getModsData(mode: ModeType): {
        readonly modsConfig: {
            readonly '?xml': '',
            readonly mods: {
                readonly mod: readonly string[]
            }
        }
        readonly modsData: readonly {
            readonly '?xml': '',
            readonly root: {
                readonly game: string
                readonly id: string
                readonly title: string
                readonly author: string
                readonly description: string
                readonly version: string
                readonly updated: string
                readonly modtype: 1 | 2 | 3 | 4
                readonly enabled: boolean
            }
        }[]
    }
    setModEnabled(mode: ModeType, modID: string): MutationResult
    setModDisabled(mode: ModeType, modID: string): MutationResult
    uploadMod(): void
    uploadModLink(): void
}