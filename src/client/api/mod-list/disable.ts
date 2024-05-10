declare global {
    interface Window {
        addEventListener(eventName: 'cfml.mod-list.disable', handler: (this: Window, ev: ModListDisableEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.disable', handler: (this: Window, ev: ModListDisableEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.disable.done', handler: (this: Window, ev: ModListDisableDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.disable.done', handler: (this: Window, ev: ModListDisableDoneEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.disable.fail', handler: (this: Window, ev: ModListDisableFailEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.disable.fail', handler: (this: Window, ev: ModListDisableFailEvent) => any): void
    }
}


export class ModListDisableEvent extends Event {
    static integrityId: string | undefined
    static async dispatch(launchType: CryoFallModLoader.LaunchType, modId: string) {
        ModListDisableEvent.integrityId = crypto.randomUUID()
        const actionEvent = new ModListDisableEvent(ModListDisableEvent.integrityId, launchType, modId)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.ModList.disable(launchType, modId)
        if (actionEvent.integrityId !== ModListDisableEvent.integrityId) {
            return
        }
        if (res.success) {
            window.dispatchEvent(new ModListDisableDoneEvent(ModListDisableEvent.integrityId, launchType, modId))
        } else {
            window.dispatchEvent(new ModListDisableFailEvent(ModListDisableEvent.integrityId, launchType, modId, res.error))
        }
    }
    static on(hander: (this: Window, ev: ModListDisableEvent) => any) {
        window.addEventListener('cfml.mod-list.disable', hander)
    }
    static off(hander: (this: Window, ev: ModListDisableEvent) => any) {
        window.removeEventListener('cfml.mod-list.disable', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
    ) {
        super('cfml.mod-list.disable')
    }
}

export class ModListDisableDoneEvent extends Event {
    static on(hander: (this: Window, ev: ModListDisableDoneEvent) => any) {
        window.addEventListener('cfml.mod-list.disable.done', hander)
    }
    static off(hander: (this: Window, ev: ModListDisableDoneEvent) => any) {
        window.removeEventListener('cfml.mod-list.disable.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
    ) {
        super('cfml.mod-list.disable.done')
    }
}

export class ModListDisableFailEvent extends Event {
    static on(hander: (this: Window, ev: ModListDisableFailEvent) => any) {
        window.addEventListener('cfml.mod-list.disable.fail', hander)
    }
    static off(hander: (this: Window, ev: ModListDisableFailEvent) => any) {
        window.removeEventListener('cfml.mod-list.disable.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
        public readonly error: string
    ) {
        super('cfml.mod-list.disable.fail')
    }
}