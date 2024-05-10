import { isFile } from "../lib/is-file"
import { pathResolve } from "../lib/path-resolve"
import jszip from 'jszip'
import { fsReadFile } from "../lib/read-file"
import { XMLParser } from "fast-xml-parser"
import { fsWriteFile } from "../lib/write-file"
import { ModsDir } from "../../common/constants"
import { Config } from "./config"

export const Mod = {
    async load(dir: string, file: string, options?: CryoFallModLoader.Mod.LoadOptions): Promise<CryoFallModLoader.Result<CryoFallModLoader.Mod.ModData>> {
        try {
            const fileName = pathResolve(dir, file)
            if (await isFile(fileName)) {
                const buffer = await fsReadFile(fileName)
                const zip = new jszip()
                const zipFiles = await zip.loadAsync(buffer)
                const headerXmlContent = await zipFiles.file("Header.xml")?.async('string')
                if (!headerXmlContent) {
                    throw new Error(`unable parse mod package header file ${fileName}`)
                }
                const parser = new XMLParser({ ignoreAttributes: false })
                const modData = parser.parse(headerXmlContent)
                return {
                    success: true,
                    payload: {
                        id: modData?.root?.id || '',
                        game: modData?.root?.game || '',
                        title: modData?.root?.title || '',
                        author: modData?.root?.author || '',
                        description: modData?.root?.description || '',
                        version: modData?.root?.version || '',
                        updated: modData?.root?.updated || '',
                        modtype: modData?.root?.modtype || 1,
                        enabled: Boolean(options?.enabled?.(modData.root.id)) || false,
                        persistent: Boolean(options?.persistent?.(modData.root.id)) || false,
                    }
                }
            }
            throw new Error(`unable load mod package ${fileName}`)
        } catch (e) {
            return {
                success: false,
                error: String(e)
            }
        }
    },
    async saveFromFile(launchType: CryoFallModLoader.LaunchType, data: Int8Array): Promise<CryoFallModLoader.Result<undefined>> {
        try {
            const dirRes = await Config.getTargetDirectory(launchType)
            if (!dirRes.success) {
                return dirRes
            }
            const buffer = Buffer.from(data)
            const zip = new jszip()
            const zipFiles = await zip.loadAsync(buffer)
            const headerXmlContent = await zipFiles.file("Header.xml")?.async('string')
            console.log('headerXmlContent', headerXmlContent)
            if (!headerXmlContent) {
                throw new Error(`unable parse mod package header file`)
            }
            const parser = new XMLParser({ ignoreAttributes: false })
            const modData = parser.parse(headerXmlContent)
            await fsWriteFile(pathResolve(dirRes.payload, ModsDir, `${modData.root.id}.mpk`), buffer)
            return {
                success: true,
            }
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    },
    async saveFromUrl(launchType: CryoFallModLoader.LaunchType, url: string): Promise<CryoFallModLoader.Result<undefined>> {
        try {
            const res = await fetch(url)
            if (!res.ok) {
                return {
                    success: false,
                    error: `${res.status}: ${res.statusText}\n${await res.text()}`
                }
            }
            const buffer = new Int8Array(await res.arrayBuffer())
            return Mod.saveFromFile(launchType, buffer)
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    }
} as const