import { getElementById } from "../../lib/get-element-by-id"
import { createNotification } from "../notification-list"
import { LaunchTypeChangeEvent } from '../app'
import { ConfigLoadDoneEvent, ConfigLoadEvent, ConfigLoadFailEvent } from "../api/config/load"
import { ConfigSaveDoneEvent, ConfigSaveEvent, ConfigSaveFailEvent } from "../api/config/save"

const configView = getElementById(document, 'config-view', HTMLFormElement)
const configClientDirInput = getElementById(document, 'config-client-dir-input', HTMLInputElement)
const configEditorDirInput = getElementById(document, 'config-editor-dir-input', HTMLInputElement)
const configServerDirInput = getElementById(document, 'config-server-dir-input', HTMLInputElement)

function render(data: CryoFallModLoader.Config.ConfigData) {
    configClientDirInput.value = data.clientDir
    configEditorDirInput.value = data.editorDir
    configServerDirInput.value = data.serverDir
}

function collect(): CryoFallModLoader.Config.ConfigData {
    return {
        clientDir: configClientDirInput.value,
        editorDir: configEditorDirInput.value,
        serverDir: configServerDirInput.value,
    }
}

configView.addEventListener('reset', e => {
    e.preventDefault()
    ConfigLoadEvent.dispatch()
})

configView.addEventListener('submit', e => {
    e.preventDefault()
    ConfigSaveEvent.dispatch(collect())
})

export async function initConfigView() {
    ConfigLoadDoneEvent.on(e => {
        render(e.payload)
    })
    ConfigLoadFailEvent.on(e => {
        createNotification('error', {
            title: 'Failed save config',
            description: e.error
        })
    })
    ConfigSaveDoneEvent.on(() => {
        ConfigLoadEvent.dispatch()
    })
    ConfigSaveFailEvent.on(e => {
        createNotification('error', {
            title: 'Failed save config',
            description: e.error
        })
    })
    await ConfigLoadEvent.dispatch()
}