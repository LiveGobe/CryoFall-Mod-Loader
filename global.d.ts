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

declare type ModLoaderConfigData = {
    readonly folderpaths: {
        readonly client: string
        readonly editor: string
        readonly server: string
    }
}

declare type ModData = {
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
}

declare type ModsCondfig = {
    readonly mods: {
        readonly mod: readonly string[]
    }
}

declare type ModsData = {
    readonly modsConfig: ModsCondfig
    readonly modsData: readonly ModsData[]
}

declare const api: {
    loadConfig(): Promise<ModLoaderConfigData>
    saveConfig(config: ModLoaderConfigData): Promise<MutationResult>
    getModsData(mode: ModeType): Promise<ModsData>
    setModEnabled(mode: ModeType, modID: string): Promise<MutationResult>
    setModDisabled(mode: ModeType, modID: string): Promise<MutationResult>
    uploadMod(mode: ModeType, mod: Int8Array): Promise<MutationResult>
    uploadModLink(mode: ModeType, link: string): Promise<MutationResult>
    deleteMod(mode: ModeType, link: string): Promise<MutationResult>
}