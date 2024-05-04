// @ts-check
/// <reference path="../global.d.ts" />

import { cloneElement, getElementById, querySelector } from "../lib/html/index.js"
import { isInstanceOf } from "./lib/instanceof/index.js"

// view
const elViewModsSwitchControl = getElementById(document, 'view-switch-control-mods', HTMLInputElement)
const elViewConfigSwitchControl = getElementById(document, 'view-switch-control-config', HTMLInputElement)
const elViewModsSwitchIcon = getElementById(document, 'view-switch-icon-mods')
const elViewConfigSwitchIcon = getElementById(document, 'view-switch-icon-config')
// modlist
const elModsView = getElementById(document, 'mods-view')
const elModListModeSwitchClient = getElementById(document, 'mod-list-mode-switch-client', HTMLInputElement)
elModListModeSwitchClient.addEventListener('change', closeModListModeSwitch)
const elModListModeSwitchServer = getElementById(document, 'mod-list-mode-switch-server', HTMLInputElement)
elModListModeSwitchServer.addEventListener('change', closeModListModeSwitch)
const elModListModeSwitchEditor = getElementById(document, 'mod-list-mode-switch-editor', HTMLInputElement)
elModListModeSwitchEditor.addEventListener('change', closeModListModeSwitch)
const elModListModeSwitchOpen = getElementById(document, '_mod-list-mode-switch', HTMLInputElement)
function closeModListModeSwitch() {
    elModListModeSwitchOpen.checked = false
}

const elModList = getElementById(document, 'mod-list')
const elModEntryTemplate = getElementById(document, 'mod-entry-template', HTMLTemplateElement)
const elModSearchInput = getElementById(document, 'mod-search-input', HTMLInputElement)

// config
const elConfigView = getElementById(document, 'config-view', HTMLFormElement)
const elFolderpathsClientInput = getElementById(document, 'folderpaths-client-input', HTMLInputElement)
const elFolderpathsEditorInput = getElementById(document, 'folderpaths-editor-input', HTMLInputElement)
const elFolderpathsServerInput = getElementById(document, 'folderpaths-server-input', HTMLInputElement)

// drag and drop
const elDropOverlayControl = getElementById(document, 'drop-overlay-control', HTMLInputElement)

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
    return 'client'
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
    filterModList()
}

async function uploadMod(file) {
    const data = await file.arrayBuffer()
    return await api.uploadMod(getCurrentModListMode(), new Int8Array(data))
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

function debounce(callback, ms) {
    let timerId = -1
    return (...args) => {
        if (!~timerId) {
            window.clearTimeout(timerId)
        }
        timerId = window.setTimeout((...args) => {
            callback(...args)
            timerId = -1
        }, ms, ...args)
    }
}

function filterModList() {
    const searchValue = elModSearchInput.value
    if (searchValue.length < 3) {
        elModList.querySelectorAll('.mod-entry').forEach(it => {
            it.classList.remove('hidden')
        })
        return
    }
    elModList.querySelectorAll('.mod-entry').forEach(it => {
        const title = querySelector(it, '.title').textContent
        let found = title?.includes(searchValue) ?? false
        if (!found) {
            const description = querySelector(it, '.description').textContent?.toLowerCase()
            found = description?.includes(searchValue) ?? false
        }
        if (!found) {
            const author = querySelector(it, '.author').textContent?.toLowerCase()
            found = author?.includes(searchValue) ?? false
        }
        it.classList.toggle('hidden', !found)
    })
}

const debouncedFilterModList = debounce(filterModList, 1000)

elModSearchInput.addEventListener('input', () => {
    if (elModList.childElementCount < 20) {
        filterModList()
    } else {
        debouncedFilterModList()
    }
})

elConfigView.addEventListener('submit', e => {
    e.preventDefault()
    saveConfig()
})
elConfigView.addEventListener('reset', e => {
    e.preventDefault()
    loadConfig()
})

window.addEventListener('dragenter', e => {
    console.log([...e.dataTransfer?.items ?? []].map(it => ({ kind: it.kind, type: it.type })))
    if (e.dataTransfer?.types?.includes('Files')) {
        elDropOverlayControl.checked = true
        e.preventDefault()
    }
})
window.addEventListener('dragover', e => {
    if (e.dataTransfer?.types?.includes('Files')) {
        elDropOverlayControl.checked = true
        e.preventDefault()
    }
})
window.addEventListener('dragleave', e => {
    if (!e.relatedTarget) {
        elDropOverlayControl.checked = false
        e.preventDefault()
    }
})
window.addEventListener('drop', async e => {
    elDropOverlayControl.checked = false
    e.preventDefault()
    const tasks = [...e.dataTransfer?.files || []].filter(it => it.name.endsWith('.mpk')).map(uploadMod)
    const resList = await Promise.all(tasks)
    resList.forEach(res => {
        if (!res.success) {
            console.error(res.errmsg)
        }
    })
    loadModsData()
})

window.addEventListener('paste', async e => {
    if (!isInstanceOf(ClipboardEvent)(e)) {
        return
    }

    const text = e.clipboardData?.getData('text/plain') ?? ''
    const uploadTasks = []
    if (/^(https?:)?\/\//.test(text)) {
        uploadTasks.push(api.uploadModLink(getCurrentModListMode(), text))
    }
    [...e.clipboardData?.files || []].filter(it => it.name.endsWith('.mpk')).forEach(it => {
        uploadTasks.push(uploadMod(it))
    })
    const resList = await Promise.all(uploadTasks)
    resList.forEach(res => {
        if (!res.success) {
            console.error(res.errmsg)
        }
    })
    loadModsData()
})

// load data
updateView()
loadConfig()
loadModsData()