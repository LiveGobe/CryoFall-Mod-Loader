import { ModsConfigFileXml } from '../../common/constants'
import { isObject } from '../../lib/is-object'
import { isString } from '../../lib/is-string'
import { isFile } from '../lib/is-file'
import { XMLParser, XMLBuilder } from "fast-xml-parser"
import { pathResolve } from '../lib/path-resolve'
import { fsReadFile } from '../lib/read-file'
import { fsWriteFile } from '../lib/write-file'

export type ModsConfigData = {
    '?xml': {
        '@_version': string
        '@_encoding': string
        '@_standalone': string
    },
    mods: {
        mod: string[],
    }
}

const defaultXmlAttrs: ModsConfigData['?xml'] = {
    '@_version': '1.0',
    '@_encoding': 'utf-8',
    '@_standalone': 'yes',
}

function getModsConfigXmlAttrs(data: unknown): ModsConfigData['?xml'] {
    let version = defaultXmlAttrs['@_version']
    let encoding = defaultXmlAttrs['@_encoding']
    let standalone = defaultXmlAttrs['@_standalone']
    if (isObject<Record<string, any>>(data) &&
        isObject<Record<string, any>>(data['?xml'])
    ) {
        version = isString(data['?xml']['@_version']) ? data['?xml']['@_version'].trim() || version : version
        encoding = isString(data['?xml']['@_encoding']) ? data['?xml']['@_encoding'].trim() || encoding : encoding
        standalone = isString(data['?xml']['@_standalone']) ? data['?xml']['@_standalone'].trim() || standalone : standalone
    }
    return {
        '@_version': version,
        '@_encoding': encoding,
        '@_standalone': standalone,
    }
}

function getModsConfigModsObj(data: unknown): ModsConfigData['mods'] {
    let mod: string[] = []
    if (isObject<{ mods: unknown }>(data)) {
        if (isObject<{ mod: unknown }>(data.mods)) {
            mod = (Array.isArray(data.mods.mod) ? data.mods.mod : [data.mods.mod]).filter(isString)
        }
    }
    return {
        mod,
    }
}

export function fixModsConfig(data: unknown): ModsConfigData {
    return {
        '?xml': getModsConfigXmlAttrs(data),
        mods: getModsConfigModsObj(data),
    }
}

export const ModsConfig = {
    async load(dir: string): Promise<CryoFallModLoader.Result<ModsConfigData>> {
        try {
            const fileName = pathResolve(dir, ModsConfigFileXml)
            if (await isFile(fileName)) {
                const parser = new XMLParser({ ignoreAttributes: false })
                const data = parser.parse(await fsReadFile(fileName))
                return {
                    success: true,
                    payload: fixModsConfig(data),
                    error: undefined,
                } as const
            }
            throw new Error(`unable to load ${fileName}`)
        } catch (e) {
            return {
                success: false,
                error: String(e),
            } as const
        }
    },
    async save(dir: string, data: ModsConfigData): Promise<CryoFallModLoader.Result<undefined>> {
        try {
            const builder = new XMLBuilder({ ignoreAttributes: false, format: true })
            const content = builder.build(data)
            await fsWriteFile(pathResolve(dir, ModsConfigFileXml), content)
            return {
                success: true,
            } as const
        } catch (e) {
            return {
                success: false,
                error: String(e),
            } as const
        }
    },
}