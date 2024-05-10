declare namespace CryoFallModLoader {
    export declare enum LaunchType {
        client = 'client',
        server = 'server',
        editor = 'editor',
    }
    export declare type SuccessResult<T> = undefined extends T ? {
        readonly success: true
        readonly payload?: T
        readonly error?: undefined
    } : {
        readonly success: true
        readonly payload: T
        readonly error?: undefined
    }

    export declare type FailureResult = {
        readonly success: false
        readonly payload?: undefined
        readonly error: string
    }

    export declare type Result<T> =
        | SuccessResult<T>
        | FailureResult

    export declare namespace Config {
        export declare type ConfigData = {
            readonly clientDir: string
            readonly editorDir: string
            readonly serverDir: string
        }
        export declare function load(): Promise<Result<ConfigData>>
        export declare function save(data: ConfigData): Promise<Result<undefined>>
    }
    export declare namespace Mod {
        export declare type ModData = {
            id: string
            game: string
            title: string
            author: string
            description: string
            version: string
            updated: string
            modtype: 1 | 2 | 3 | 4
            enabled: boolean
            persistent: boolean
        }
        export declare type LoadOptions = {
            enabled?: (modId: string) => any
            persistent?: (modId: string) => any
        }
        export declare function load(dir: string, file: string, options?: LoadOptions): Promise<Result<ModData>>
        export declare function saveFromFile(dir: string, data: Int8Array): Promise<Result<undefined>>
        export declare function saveFromUrl(dir: string, url: string): Promise<Result<undefined>>
    }
    export declare namespace ModList {
        export declare function load(launchType: LaunchType): Promise<Result<Array<Mod.ModData>>>
        export declare function enable(launchType: LaunchType, modId: string): Promise<Result<undefined>>
        export declare function disable(launchType: LaunchType, modId: string): Promise<Result<undefined>>
        declare function _delete(launchType: LaunchType, modId: string): Promise<Result<undefined>>
        export { _delete as delete }
    }
}