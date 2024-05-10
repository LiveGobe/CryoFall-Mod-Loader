import { stat } from 'node:fs/promises'
import { PathLike } from 'node:fs'

export async function isFile(path: PathLike) {
    try {
        return (await stat(path)).isFile()
    } catch (_) {
        return false
    }
}