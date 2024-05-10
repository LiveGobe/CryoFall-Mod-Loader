import { unlink } from 'node:original-fs';
import { ModsDir } from '../../common/constants';
import { fsDeleteFile } from '../lib/fs-delete-file';
import { isFile } from '../lib/is-file';
import { pathResolve } from '../lib/path-resolve';
import { fsReadDir } from '../lib/read-dir';
import { Config } from './config';
import { Mod } from './mod';
import { ModsConfig } from './mods-config';

export const ModList = {
    async load(type: CryoFallModLoader.LaunchType): Promise<CryoFallModLoader.Result<Array<CryoFallModLoader.Mod.ModData>>> {
        try {
            const dirRes = await Config.getTargetDirectory(type)
            if (!dirRes.success) {
                return dirRes
            }
            if (!dirRes.payload) {
                throw new Error(`Target directory not configured`)
            }
            const modsConfigRes = await ModsConfig.load(dirRes.payload)
            if (!modsConfigRes.success) {
                return modsConfigRes
            }
            const modsDir = pathResolve(dirRes.payload, ModsDir)
            const modDataTasks: Promise<CryoFallModLoader.Result<CryoFallModLoader.Mod.ModData>>[] = []
            const dirList = await fsReadDir(modsDir)
            dirList.forEach(file => {
                if (!file.endsWith('.mpk')) {
                    return
                }
                modDataTasks.push(Mod.load(modsDir, file, {
                    enabled(modId) {
                        return ~modsConfigRes.payload.mods.mod.findIndex(it => it.startsWith(modId))
                    }
                }))
            })
            const modDataList = await Promise.all(modDataTasks)
            const payload: CryoFallModLoader.Mod.ModData[] = []
            modDataList.forEach(it => {
                if (!it.success) {
                    console.error(it.error)
                } else {
                    payload.push(it.payload)
                }
            })
            return {
                success: true,
                payload,
            }
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    },
    async enable(type: CryoFallModLoader.LaunchType, modId: string): Promise<CryoFallModLoader.Result<undefined>> {
        try {
            const dirRes = await Config.getTargetDirectory(type)
            if (!dirRes.success) {
                return dirRes
            }
            const modsConfigRes = await ModsConfig.load(dirRes.payload)
            if (!modsConfigRes.success) {
                return modsConfigRes
            }
            const data = {
                ...modsConfigRes.payload,
            }
            data.mods.mod = Array.from(new Set(data.mods.mod.concat(modId)))
            return await ModsConfig.save(dirRes.payload, data)
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    },
    async disable(type: CryoFallModLoader.LaunchType, modId: string): Promise<CryoFallModLoader.Result<undefined>> {
        try {
            const dirRes = await Config.getTargetDirectory(type)
            if (!dirRes.success) {
                return dirRes
            }
            const modsConfigRes = await ModsConfig.load(dirRes.payload)
            if (!modsConfigRes.success) {
                return modsConfigRes
            }
            const data = {
                ...modsConfigRes.payload,
            }
            data.mods.mod = data.mods.mod.filter(it => !it.startsWith(modId))
            return await ModsConfig.save(dirRes.payload, data)
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    },
    async delete(type: CryoFallModLoader.LaunchType, modId: string): Promise<CryoFallModLoader.Result<undefined>> {
        try {
            const dirRes = await Config.getTargetDirectory(type)
            if (!dirRes.success) {
                return dirRes
            }
            const modsConfigRes = await ModsConfig.load(dirRes.payload)
            if (!modsConfigRes.success) {
                return modsConfigRes
            }
            const data = {
                ...modsConfigRes.payload,
            }
            data.mods.mod = data.mods.mod.filter(it => !it.startsWith(modId))
            const saveRes = await ModsConfig.save(dirRes.payload, data)
            if (!saveRes.success) {
                return saveRes
            }
            await fsDeleteFile(pathResolve(dirRes.payload, ModsDir, modId + '.mpk'))
            return {
                success: true
            }
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    },
} as const