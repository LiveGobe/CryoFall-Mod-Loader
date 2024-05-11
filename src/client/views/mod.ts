import { getElementById } from "../../lib/get-element-by-id"
import { querySelector } from "../../lib/query-selector"
import { ModListDeleteDoneEvent, ModListDeleteEvent } from "../api/mod-list/delete"
import { ModListDisableEvent } from "../api/mod-list/disable"
import { ModListEnableEvent } from "../api/mod-list/enable"
import { getCurrentLaunchType, setCurrentView, ViewType } from "../app"

const modView = getElementById(document, 'mod-view')

const author = querySelector(modView, '.author')
const title = querySelector(modView, '.title')
const description = querySelector(modView, '.description')
const version = querySelector(modView, '.version')
const deleteMod = querySelector(modView, `.button[data-action=deleteMod]`, HTMLButtonElement)
const statusSwitch = {
    control: querySelector(modView, `.status-switch.control`, HTMLInputElement),
    button: querySelector(modView, `.status-switch.button`, HTMLLabelElement),
    titleEnabled: querySelector(modView, `.status-switch.title.enabled`),
    titleDisabled: querySelector(modView, `.status-switch.title.disabled`),
}
statusSwitch.control.id = '_' + crypto.randomUUID()
statusSwitch.button.setAttribute('for', statusSwitch.control.id)

deleteMod.addEventListener('click', () => {
    const modId = modView.getAttribute('data-mod-id')
    if (!modId) {
        return
    }
    ModListDeleteEvent.dispatch(getCurrentLaunchType(), modId)
})
statusSwitch.control.addEventListener('change', () => {
    const modId = modView.getAttribute('data-mod-id')
    if (!modId) {
        return
    }
    if (statusSwitch.control.checked) {
        ModListEnableEvent.dispatch(getCurrentLaunchType(), modId)
    } else {
        ModListDisableEvent.dispatch(getCurrentLaunchType(), modId)
    }
})

export function renderMod(modId: string) {
    const node = querySelector(document, `.mod-entry[data-mod-id=${modId}]`)
    const modAuthor = querySelector(node, '.author')
    const modTitle = querySelector(node, '.title')
    const modDescription = querySelector(node, '.description')
    const modVersion = querySelector(node, '.version')
    const modStatusSwitch = {
        control: querySelector(node, `.status-switch.control`, HTMLInputElement),
    }
    modView.setAttribute('data-mod-id', modId)
    author.textContent = modAuthor.textContent
    title.textContent = modTitle.textContent
    description.textContent = modDescription.textContent
    version.textContent = modVersion.textContent
    statusSwitch.control.checked = modStatusSwitch.control.checked
    statusSwitch.control.value = modId
}
export async function initModView() {
    ModListDeleteDoneEvent.on(e => {
        if (modView.getAttribute('data-mod-id') === e.modId) {
            setCurrentView(ViewType.modList)
        }
    })
}