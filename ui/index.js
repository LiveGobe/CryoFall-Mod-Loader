// @ts-check
/// <reference path="../global.d.ts" />

import { cloneElement, getElementById, querySelector } from "../lib/html/index.js"

// view
const elViewModsSwitchControl = getElementById(document, 'view-switch-control-mods', HTMLInputElement)
const elViewConfigSwitchControl = getElementById(document, 'view-switch-control-config', HTMLInputElement)
const elViewModsSwitchIcon = getElementById(document, 'view-switch-icon-mods')
const elViewConfigSwitchIcon = getElementById(document, 'view-switch-icon-config')
// modlist
const elModsView = getElementById(document, 'mods-view')
const elModListModeSwitchClient = getElementById(document, 'mod-list-mode-switch-client', HTMLInputElement)
elModListModeSwitchClient.addEventListener('change', () => {
    elModListModeSwitchOpen.checked = false
})
const elModListModeSwitchServer = getElementById(document, 'mod-list-mode-switch-server', HTMLInputElement)
elModListModeSwitchServer.addEventListener('change', () => {
    elModListModeSwitchOpen.checked = false
})
const elModListModeSwitchEditor = getElementById(document, 'mod-list-mode-switch-editor', HTMLInputElement)
elModListModeSwitchEditor.addEventListener('change', () => {
    elModListModeSwitchOpen.checked = false
})
const elModListModeSwitchOpen = getElementById(document, '_mod-list-mode-switch', HTMLInputElement)

const elModList = getElementById(document, 'mod-list')
const elModEntryTemplate = getElementById(document, 'mod-entry-template', HTMLTemplateElement)

// config
const elConfigView = getElementById(document, 'config-view', HTMLFormElement)
const elFolderpathsClientInput = getElementById(document, 'folderpaths-client-input', HTMLInputElement)
const elFolderpathsEditorInput = getElementById(document, 'folderpaths-editor-input', HTMLInputElement)
const elFolderpathsServerInput = getElementById(document, 'folderpaths-server-input', HTMLInputElement)

function getCurrentView() {
    if (elViewModsSwitchControl.checked) {
        return 'mods'
    }
    if (elViewConfigSwitchControl.checked) {
        return 'config'
    }
    return 'mods'
}

function getCurrentModListMode() {
    if (elModListModeSwitchClient.checked) {
        return 'client'
    }
    if (elModListModeSwitchServer.checked) {
        return 'server'
    }
    if (elModListModeSwitchEditor.checked) {
        return 'editor'
    }
    return ''
}

// api call
async function deleteMod(mode, modID) {
    const currentMode = getCurrentModListMode()
    if (currentMode !== mode || !currentMode) {
        return
    }
    const res = await api.deleteMod(currentMode, modID)
    if (!res.success) {
        console.error(res.errmsg)
        return
    }
    await loadModsData()
}

async function setModEnabled(mode, modID) {
    toggleModEnabled(mode, modID, true)
}
async function setModDisabled(mode, modID) {
    toggleModEnabled(mode, modID, false)
}
async function toggleModEnabled(mode, modID, enabled) {
    const currentMode = getCurrentModListMode()
    if (currentMode !== mode || !currentMode) {
        return
    }
    const res = enabled
        ? await api.setModEnabled(currentMode, modID)
        : await api.setModDisabled(currentMode, modID)
    if (!res.success) {
        console.error(res.errmsg)
    }
    await loadModsData()
}

async function loadModsData() {
    const currentMode = getCurrentModListMode()
    if (!currentMode) {
        return
    }
    const { modsData } = await api.getModsData(currentMode)
    renderModList(currentMode, modsData)
}

async function loadConfig() {
    const config = await api.loadConfig()
    elFolderpathsClientInput.value = config.folderpaths.client
    elFolderpathsEditorInput.value = config.folderpaths.editor
    elFolderpathsServerInput.value = config.folderpaths.server
}

async function saveConfig() {
    const res = await api.saveConfig({
        folderpaths: {
            client: elFolderpathsClientInput.value,
            editor: elFolderpathsEditorInput.value,
            server: elFolderpathsServerInput.value,
        }
    })
    if (!res.success) {
        console.error(res.errmsg)
    }
    await loadConfig()
}

// render

function getModEntryFields(root) {
    return {
        title: querySelector(root, `.title`),
        author: querySelector(root, `.author`),
        version: querySelector(root, `.version`),
        description: querySelector(root, `.description`),
        deleteMod: querySelector(root, `.button[data-action=deleteMod]`),
        statusSwitch: {
            control: querySelector(root, `.status-switch.control`, HTMLInputElement),
            button: querySelector(root, `.status-switch.button`, HTMLLabelElement),
            titleEnabled: querySelector(root, `.status-switch.title.enabled`),
            titleDisabled: querySelector(root, `.status-switch.title.disabled`),
        }
    }
}

function renderModEntry(mode, modData) {
    const currentMode = getCurrentModListMode()
    if (currentMode !== mode) {
        return
    }
    let root = elModList.querySelector(`.mod-entry[data-mod-id=${modData.root.id}]`)
    if (!root) {
        root = querySelector(cloneElement(elModEntryTemplate.content), '.mod-entry')
        root.setAttribute('data-mod-id', modData.root.id)
    }
    const elements = getModEntryFields(root)
    if (elements.title.innerText !== modData.root.title) {
        elements.title.innerText = modData.root.title
    }
    if (elements.author.innerText !== modData.root.author) {
        elements.author.innerText = modData.root.author
    }
    if (elements.version.innerText !== modData.root.version) {
        elements.version.innerText = modData.root.version
    }
    if (elements.description.innerText !== modData.root.description) {
        elements.description.innerText = modData.root.description
    }
    elements.statusSwitch.control.id = 'mod-entry-status-switch--' + modData.root.id
    elements.statusSwitch.control.checked = modData.root.enabled
    elements.statusSwitch.button.setAttribute('for', elements.statusSwitch.control.id)
    elements.deleteMod.addEventListener('click', () => {
        deleteMod(mode, modData.root.id)
    }, { once: true })
    elements.statusSwitch.control.addEventListener('change', () => {
        toggleModEnabled(currentMode, modData.root.id, elements.statusSwitch.control.checked)
    }, { once: true })
    return root
}

function renderModList(mode, modsData) {
    const currentMode = getCurrentModListMode()
    if (mode !== currentMode) {
        return
    }
    const usedModIDs = new Set()
    modsData.every((modData, index) => {
        // array every can be used as forEach with flow control statements
        usedModIDs.add(modData.id)
        const modEntry = renderModEntry(currentMode, modData)
        if (!modEntry) {
            // break
            return false
        }
        // reorder mod entries
        if (elModList.childNodes.item(index) !== modEntry) {
            elModList.insertBefore(modEntry, elModList.childNodes.item(index))
        }
        // continue
        return true
    })
    for (let i = modsData.length; i < elModList.childNodes.length; i++) {
        // remove rest mod entries
        elModList.childNodes.item(i)?.remove()
    }
}

function switchToConfigView() {
    elConfigView.hidden = false
    elModsView.hidden = true
    elViewConfigSwitchIcon.hidden = true
    elViewModsSwitchIcon.hidden = false
}

function switchToModsView() {
    elConfigView.hidden = true
    elModsView.hidden = false
    elViewConfigSwitchIcon.hidden = false
    elViewModsSwitchIcon.hidden = true
    loadConfig()
}

function updateView() {
    const currentView = getCurrentView()
    switch (currentView) {
        case 'config':
            switchToConfigView()
            break
        case 'mods':
            switchToModsView()
            break
    }
}

// setup handlers
elViewModsSwitchControl.addEventListener('change', updateView)
elViewConfigSwitchControl.addEventListener('change', updateView)

elModListModeSwitchClient.addEventListener('change', loadModsData)
elModListModeSwitchServer.addEventListener('change', loadModsData)
elModListModeSwitchEditor.addEventListener('change', loadModsData)

elConfigView.addEventListener('submit', e => {
    e.preventDefault()
    saveConfig()
})
elConfigView.addEventListener('reset', e => {
    e.preventDefault()
    loadConfig()
})

// load data
updateView()
loadConfig()
loadModsData()