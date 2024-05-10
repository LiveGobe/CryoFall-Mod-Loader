import { getElementById } from "../lib/get-element-by-id"
import { createNotification } from "./notification-list"
import { LaunchTypeChangeEvent } from './app'

const configView = getElementById(document, 'config-view', HTMLFormElement)
const configClientDirInput = getElementById(document, 'config-client-dir-input', HTMLInputElement)
const configEditorDirInput = getElementById(document, 'config-editor-dir-input', HTMLInputElement)
const configServerDirInput = getElementById(document, 'config-server-dir-input', HTMLInputElement)

LaunchTypeChangeEvent.on(loadConfig)

export async function loadConfig() {
    const res = await CryoFallModLoader.Config.load()
    if (!res.success) {
        createNotification('error', {
            title: 'Failed load config',
            description: res.error
        })
    }
    configClientDirInput.value = res.payload?.clientDir ?? ''
    configEditorDirInput.value = res.payload?.editorDir ?? ''
    configServerDirInput.value = res.payload?.serverDir ?? ''
}

export async function saveConfig() {
    const data: CryoFallModLoader.Config.ConfigData = {
        clientDir: configClientDirInput.value,
        editorDir: configEditorDirInput.value,
        serverDir: configServerDirInput.value,
    }
    const res = await CryoFallModLoader.Config.save(data)
    if (!res.success) {
        createNotification('error', {
            title: 'Failed save config',
            description: res.error
        })
        return
    }
    loadConfig()
}

configView.addEventListener('reset', e => {
    e.preventDefault()
    loadConfig()
})

configView.addEventListener('submit', e => {
    e.preventDefault()
    loadConfig()
})