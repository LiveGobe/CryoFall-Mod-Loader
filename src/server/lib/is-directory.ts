import { stat } from 'node:fs/promises'
import { PathLike } from 'node:fs'

export async function isDirectory(path: PathLike) {
    try {
        return (await stat(path)).isDirectory()
    } catch (_) {
        return false
    }
}