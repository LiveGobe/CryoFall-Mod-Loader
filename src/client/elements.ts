import { getElementById } from "../lib/get-element-by-id"

// view
export const viewModsSwitchControl = getElementById(document, 'view-switch-control-mods', HTMLInputElement)
viewModsSwitchControl.checked = true
export const viewConfigSwitchControl = getElementById(document, 'view-switch-control-config', HTMLInputElement)
export const viewModSwitchControl = getElementById(document, 'view-switch-control-mod', HTMLInputElement)
export const viewModsSwitchIcon = getElementById(document, 'view-switch-icon-mods')
export const viewConfigSwitchIcon = getElementById(document, 'view-switch-icon-config')
// modlist
export const modsView = getElementById(document, 'mods-view')

export const modListError = getElementById(document, 'mod-list--error')
export const modListEmpty = getElementById(document, 'mod-list--empty')

// upload mode dialog
export const uplaodModDialogOpenButton = getElementById(document, 'upload-mod-dialog-open-button', HTMLButtonElement)
uplaodModDialogOpenButton.addEventListener('click', () => {
    uploadModDialog.showModal()
})
export const uploadModDialog = getElementById(document, 'upload-mod-dialog', HTMLDialogElement)
uploadModDialog.addEventListener('click', e => {
    const { target, currentTarget } = e
    if (target !== currentTarget) {
        return
    }
    const { top, left, bottom, right } = uploadModDialog.getBoundingClientRect()
    const { clientX, clientY } = e
    const insideVertical = top <= clientY && clientY <= bottom
    const insideHorizontal = left <= clientX && clientX <= right
    if (insideVertical && insideHorizontal) {
        return
    }
    uploadModDialog.close()
})

export const uploadModFileInput = getElementById(document, 'upload-mod-file-input', HTMLInputElement)
export const uploadModLinkForm = getElementById(document, 'upload-mod-link-form', HTMLFormElement)
export const uploadModLinkInput = getElementById(document, 'upload-mod-link-input', HTMLInputElement)

export const modList = getElementById(document, 'mod-list')
export const modEntryTemplate = getElementById(document, 'mod-entry-template', HTMLTemplateElement)
export const modSearchInput = getElementById(document, 'mod-search-input', HTMLInputElement)

// config
export const configView = getElementById(document, 'config-view', HTMLFormElement)
export const configClientDirInput = getElementById(document, 'config-client-dir-input', HTMLInputElement)
export const configEditorDirInput = getElementById(document, 'config-editor-dir-input', HTMLInputElement)
export const configServerDirInput = getElementById(document, 'config-server-dir-input', HTMLInputElement)

// drag and drop
export const dropOverlayControl = getElementById(document, 'drop-overlay-control', HTMLInputElement)
