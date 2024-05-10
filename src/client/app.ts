import { getElementById } from "../lib/get-element-by-id"

export const viewModsSwitchControl = getElementById(document, 'view-switch-control-mods', HTMLInputElement)
viewModsSwitchControl.checked = true
export const viewConfigSwitchControl = getElementById(document, 'view-switch-control-config', HTMLInputElement)
export const viewModSwitchControl = getElementById(document, 'view-switch-control-mod', HTMLInputElement)

export enum ViewType {
    modList = 'mod-list',
    mod = 'mod',
    config = 'config',
}

export function getCurrentView(): ViewType {
    if (viewConfigSwitchControl.checked) {
        return ViewType.config
    }
    if (viewModSwitchControl.checked) {
        return ViewType.mod
    }
    return ViewType.modList
}

export function setCurrentView(view: ViewType) {
    viewModsSwitchControl.checked = view === ViewType.modList
    viewConfigSwitchControl.checked = view === ViewType.config
    viewModSwitchControl.checked = view === ViewType.mod
}

export class LaunchTypeChangeEvent extends Event {
    static dispatch(launchType: CryoFallModLoader.LaunchType) {
        return window.dispatchEvent(new LaunchTypeChangeEvent(launchType))
    }
    static on(handler: (this: Window, ev: LaunchTypeChangeEvent) => any) {
        window.addEventListener('cfml:launch-type.change', handler)
    }
    static off(handler: (this: Window, ev: LaunchTypeChangeEvent) => any) {
        window.removeEventListener('cfml:launch-type.change', handler)
    }
    constructor(launchType: CryoFallModLoader.LaunchType) {
        super('cfml:launch-type.change')
        this.launchType = launchType
    }
    readonly launchType: CryoFallModLoader.LaunchType
}

declare global {
    interface Window {
        addEventListener(eventName: 'cfml:launch-type.change', handler: (this: Window, ev: LaunchTypeChangeEvent) => any): void
        removeEventListener(eventName: 'cfml:launch-type.change', handler: (this: Window, ev: LaunchTypeChangeEvent) => any): void
    }
}

export const launchTypeSwitchClient = getElementById(document, 'launch-type-client', HTMLInputElement)
launchTypeSwitchClient.value = CryoFallModLoader.LaunchType.client
launchTypeSwitchClient.addEventListener('change', launchTypeSelectorClose)
launchTypeSwitchClient.addEventListener('change', () => {
    LaunchTypeChangeEvent.dispatch(CryoFallModLoader.LaunchType.client)
})
export const launchTypeSwitchServer = getElementById(document, 'launch-type-server', HTMLInputElement)
launchTypeSwitchServer.value = CryoFallModLoader.LaunchType.server
launchTypeSwitchServer.addEventListener('change', launchTypeSelectorClose)
launchTypeSwitchServer.addEventListener('change', () => {
    LaunchTypeChangeEvent.dispatch(CryoFallModLoader.LaunchType.server)
})
export const launchTypeSwitchEditor = getElementById(document, 'launch-type-editor', HTMLInputElement)
launchTypeSwitchEditor.value = CryoFallModLoader.LaunchType.editor
launchTypeSwitchEditor.addEventListener('change', launchTypeSelectorClose)
launchTypeSwitchEditor.addEventListener('change', () => {
    LaunchTypeChangeEvent.dispatch(CryoFallModLoader.LaunchType.editor)
})
export const launchTypeSwitchOpen = getElementById(document, '_launch-type', HTMLInputElement)
function launchTypeSelectorClose() {
    launchTypeSwitchOpen.checked = false
}

export function getCurrentLaunchType(): CryoFallModLoader.LaunchType {
    if (launchTypeSwitchServer.checked) {
        return CryoFallModLoader.LaunchType.server
    }
    if (launchTypeSwitchEditor.checked) {
        return CryoFallModLoader.LaunchType.editor
    }
    return CryoFallModLoader.LaunchType.client
}

export function setLaunchType(launchType: CryoFallModLoader.LaunchType) {
    launchTypeSwitchClient.checked = launchType === CryoFallModLoader.LaunchType.client
    launchTypeSwitchServer.checked = launchType === CryoFallModLoader.LaunchType.server
    launchTypeSwitchEditor.checked = launchType === CryoFallModLoader.LaunchType.editor
    LaunchTypeChangeEvent.dispatch(launchType)
}
