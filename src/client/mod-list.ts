import { cloneElement } from "../lib/clone-element"
import { debounce } from "../lib/debounce"
import { getElementById } from "../lib/get-element-by-id"
import { querySelector } from "../lib/query-selector"
import { ModListDeleteDoneEvent, ModListDeleteEvent, ModListDeleteFailEvent } from "./api/mod-list/delete"
import { ModListDisableDoneEvent, ModListDisableEvent, ModListDisableFailEvent } from "./api/mod-list/disable"
import { ModListEnableDoneEvent, ModListEnableEvent, ModListEnableFailEvent } from "./api/mod-list/enable"
import { ModListLoadDoneEvent, ModListLoadEvent, ModListLoadFailEvent } from "./api/mod-list/load"
import { getCurrentLaunchType, LaunchTypeChangeEvent } from "./app"
import { renderMod } from "./mod"
import { createNotification } from "./notification-list"

const modList = getElementById(document, 'mod-list')
const modListError = getElementById(document, 'mod-list--error')
// const modListEmpty = getElementById(document, 'mod-list--empty')
const modEntryTemplate = getElementById(document, 'mod-entry-template', HTMLTemplateElement)
const modSearchInput = getElementById(document, 'mod-search-input', HTMLInputElement)

function renderModListError(launchType: CryoFallModLoader.LaunchType, error: string | null | undefined) {
    if (getCurrentLaunchType() !== launchType) {
        return
    }
    modListError.textContent = error || null
}
const debouncedFilterModList = debounce(filterModList, 1000)


modSearchInput.addEventListener('input', () => {
    if (modList.childElementCount < 100) {
        debouncedFilterModList.runNow()
    } else {
        debouncedFilterModList()
    }
})

function getModEntryFields(root: Element) {
    return {
        header: querySelector(root, `.header`),
        title: querySelector(root, `.title`),
        author: querySelector(root, `.author`),
        version: querySelector(root, `.version`),
        description: querySelector(root, `.description`),
        deleteMod: querySelector(root, `.button[data-action=deleteMod]`, HTMLButtonElement),
        statusSwitch: {
            control: querySelector(root, `.status-switch.control`, HTMLInputElement),
            button: querySelector(root, `.status-switch.button`, HTMLLabelElement),
            titleEnabled: querySelector(root, `.status-switch.title.enabled`),
            titleDisabled: querySelector(root, `.status-switch.title.disabled`),
        }
    }
}

function createModEntry(launchType: CryoFallModLoader.LaunchType, modData: CryoFallModLoader.Mod.ModData) {
    const node = querySelector(cloneElement(modEntryTemplate.content), '.mod-entry')
    node.setAttribute('data-mod-id', modData.id)
    const elements = getModEntryFields(node)
    elements.header.addEventListener('click', () => {
        renderMod(modData.id)
    })
    elements.statusSwitch.control.id = 'mod-entry-status-switch--' + modData.id
    elements.statusSwitch.button.setAttribute('for', elements.statusSwitch.control.id)
    elements.deleteMod.addEventListener('click', async () => {
        if (node.classList.contains('suspend')) {
            return
        }
        node.classList.add('suspend')
        await ModListDeleteEvent.dispatch(launchType, modData.id)
        node.classList.remove('suspend')
    })
    elements.statusSwitch.control.addEventListener('change', async () => {
        if (node.classList.contains('suspend')) {
            return
        }
        node.classList.add('suspend')
        if (elements.statusSwitch.control.checked) {
            await ModListEnableEvent.dispatch(launchType, modData.id)
        } else {
            await ModListDisableEvent.dispatch(launchType, modData.id)
        }
        node.classList.remove('suspend')
    })
    return node
}

function renderModEntry(launchType: CryoFallModLoader.LaunchType, modData: CryoFallModLoader.Mod.ModData) {
    const currentlaunchType = getCurrentLaunchType()
    if (currentlaunchType !== launchType) {
        return
    }
    let node = modList.querySelector(`.mod-entry[data-mod-id=${modData.id}]`)
    if (!node) {
        node = createModEntry(launchType, modData)
    }
    const elements = getModEntryFields(node)
    elements.statusSwitch.control.checked = modData.enabled
    if (elements.title.innerText !== modData.title) {
        elements.title.innerText = modData.title
    }
    if (elements.author.innerText !== modData.author) {
        elements.author.innerText = modData.author
    }
    if (elements.version.innerText !== modData.version) {
        elements.version.innerText = modData.version
    }
    if (elements.description.innerText !== modData.description) {
        elements.description.innerText = modData.description
    }
    return node
}

export function renderModList(launchType: CryoFallModLoader.LaunchType, modDataList: readonly CryoFallModLoader.Mod.ModData[]) {
    if (getCurrentLaunchType() !== launchType) {
        return
    }
    modDataList.every((modData, index) => {
        const modEntry = renderModEntry(launchType, modData)
        if (!modEntry) {
            // break
            return false
        }
        // reorder mod entries
        if (modList.childNodes.item(index) !== modEntry) {
            modList.insertBefore(modEntry, modList.childNodes.item(index))
        }
        // continue
        return true
    })
    while (modDataList.length < modList.childNodes.length) {
        // remove rest mod entries
        modList.childNodes.item(modDataList.length)?.remove()
    }
    filterModList()
}

export function filterModList() {
    const searchValue = modSearchInput.value
    if (searchValue.length < 3) {
        modList.querySelectorAll('.mod-entry').forEach(it => {
            it.classList.remove('hidden')
        })
        return
    }
    modList.querySelectorAll('.mod-entry').forEach(it => {
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

export async function initModListView() {
    LaunchTypeChangeEvent.on(e => {
        ModListLoadEvent.dispatch(e.launchType)
    })

    ModListLoadEvent.on(console.log.bind(console))
    ModListLoadEvent.on(debouncedFilterModList.cancel)
    ModListLoadDoneEvent.on(console.log.bind(console))
    ModListLoadDoneEvent.on(e => {
        renderModList(e.launchType, e.payload)
        renderModListError(e.launchType, null)
    })
    ModListLoadFailEvent.on(e => {
        renderModList(e.launchType, [])
        renderModListError(e.launchType, e.error)
    })

    ModListDeleteEvent.on(debouncedFilterModList.cancel)
    ModListDeleteDoneEvent.on(e => {
        ModListLoadEvent.dispatch(e.launchType)
    })
    ModListDeleteFailEvent.on(e => {
        createNotification('error', {
            title: 'Delete failed',
            description: e.error,
        })
        ModListLoadEvent.dispatch(e.launchType)
    })

    ModListEnableEvent.on(debouncedFilterModList.cancel)
    ModListEnableDoneEvent.on(e => {
        ModListLoadEvent.dispatch(e.launchType)
    })
    ModListEnableFailEvent.on(e => {
        createNotification('error', {
            title: 'Enable failed',
            description: e.error,
        })
        ModListLoadEvent.dispatch(e.launchType)
    })

    ModListDisableEvent.on(debouncedFilterModList.cancel)
    ModListDisableDoneEvent.on(e => {
        ModListLoadEvent.dispatch(e.launchType)
    })
    ModListDisableFailEvent.on(e => {
        createNotification('error', {
            title: 'Disable failed',
            description: e.error,
        })
        ModListLoadEvent.dispatch(e.launchType)
    })
    await ModListLoadEvent.dispatch(getCurrentLaunchType())
}
