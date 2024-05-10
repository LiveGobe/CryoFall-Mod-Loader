import { AtomicTorchStudioDir, CryoFallDir, CryoFallEditorDir, DocumentsDir } from "../../common/constants"
import { isDirectory } from "../lib/is-directory"
import { isFile } from "../lib/is-file"
import { pathJoin } from "../lib/path-join"
import { pathResolve } from "../lib/path-resolve"
import { fsReadFile } from '../lib/read-file'
import { fsWriteFile } from '../lib/write-file'

async function getDefaultDirs() {
    const homeDir = process.env.HOME ?? ''
    const oneDriveDir = process.env.OneDrive ?? ''
    const clientDir = pathJoin(homeDir, DocumentsDir, AtomicTorchStudioDir, CryoFallDir)
    const editorDir = pathJoin(homeDir, DocumentsDir, AtomicTorchStudioDir, CryoFallEditorDir)
    const oneDriveClientDir = pathJoin(oneDriveDir, DocumentsDir, AtomicTorchStudioDir, CryoFallDir)
    const oneDriveEditorDir = pathJoin(oneDriveDir, DocumentsDir, AtomicTorchStudioDir, CryoFallEditorDir)
    const [
        clientDirExists,
        editorDirExists,
        oneDriveClientDirExists,
        oneDriveEditorDirExists,
    ] = await Promise.all([
        isDirectory(clientDir),
        isDirectory(editorDir),
        isDirectory(oneDriveClientDir),
        isDirectory(oneDriveEditorDir),
    ])
    return {
        clientDir: (oneDriveClientDirExists && oneDriveClientDir) || (clientDirExists && clientDir) || '',
        editorDir: (oneDriveEditorDirExists && oneDriveEditorDir) || (editorDirExists && editorDir) || '',
        serverDir: '',
    } as const
}

export const Config = {
    async load(): Promise<CryoFallModLoader.Result<CryoFallModLoader.Config.ConfigData>> {
        try {
            const fileName = pathResolve(process.cwd(), 'config.json')
            const exists = await isFile(fileName)
            let payload: CryoFallModLoader.Config.ConfigData | undefined
            if (exists) {
                try {
                    const buffer = await fsReadFile(fileName)
                    const content = buffer.toString('utf-8')
                    payload = JSON.parse(content)
                } catch (e) {
                    console.error(e)
                    console.info('restore config to defaults')
                }
            }
            const { clientDir, editorDir, serverDir } = await getDefaultDirs()
            if (!payload) {
                payload = {
                    clientDir,
                    editorDir,
                    serverDir,
                }
            } else {
                payload = {
                    clientDir: payload.clientDir.trim() || clientDir,
                    editorDir: payload.editorDir.trim() || editorDir,
                    serverDir: payload.serverDir.trim() || serverDir,
                }
            }
            if (!exists) {
                await fsWriteFile(fileName, JSON.stringify(payload, null, 2))
            }
            return {
                success: true,
                payload: payload,
            }
        } catch (e) {
            return {
                success: false,
                error: String(e),
            }
        }
    },
    async save(data: CryoFallModLoader.Config.ConfigData) {
        const fileName = pathResolve(process.cwd(), 'config.json')
        try {
            await fsWriteFile(fileName, JSON.stringify(data, null, 2))
            return {
                success: true,
                errmsg: undefined,
            }
        } catch (e) {
            return {
                success: false,
                errmsg: String(e),
            }
        }
    },
    async getTargetDirectory(type: CryoFallModLoader.LaunchType): Promise<CryoFallModLoader.Result<string>> {
        const configRes = await Config.load()
        if (!configRes.success) {
            return configRes
        }
        switch (type) {
            case 'client': return {
                success: true,
                payload: configRes.payload.clientDir,
            }
            case 'server': return {
                success: true,
                payload: configRes.payload.serverDir,
            }
            case 'editor': return {
                success: true,
                payload: configRes.payload.editorDir,
            }
            default: return {
                success: false,
                error: 'unsupported launch type',
            }
        }
    }
} as const