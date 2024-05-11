declare global {
    interface Window {
        addEventListener(eventName: 'cfml.mod-list.enable', handler: (this: Window, ev: ModListEnableEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.enable', handler: (this: Window, ev: ModListEnableEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.enable.done', handler: (this: Window, ev: ModListEnableDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.enable.done', handler: (this: Window, ev: ModListEnableDoneEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.enable.fail', handler: (this: Window, ev: ModListEnableFailEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.enable.fail', handler: (this: Window, ev: ModListEnableFailEvent) => any): void
    }
}

export class ModListEnableEvent extends Event {
    static integrityId: string | undefined
    static async dispatch(launchType: CryoFallModLoader.LaunchType, modId: string) {
        ModListEnableEvent.integrityId = crypto.randomUUID()
        const actionEvent = new ModListEnableEvent(ModListEnableEvent.integrityId, launchType, modId)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.ModList.enable(launchType, modId)
        if (actionEvent.integrityId !== ModListEnableEvent.integrityId) {
            return
        }
        if (res.success) {
            window.dispatchEvent(new ModListEnableDoneEvent(ModListEnableEvent.integrityId, launchType, modId))
        } else {
            window.dispatchEvent(new ModListEnableFailEvent(ModListEnableEvent.integrityId, launchType, modId, res.error))
        }
    }
    static on(hander: (this: Window, ev: ModListEnableEvent) => any) {
        window.addEventListener('cfml.mod-list.enable', hander)
    }
    static off(hander: (this: Window, ev: ModListEnableEvent) => any) {
        window.removeEventListener('cfml.mod-list.enable', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
    ) {
        super('cfml.mod-list.enable')
    }
}

export class ModListEnableDoneEvent extends Event {
    static on(hander: (this: Window, ev: ModListEnableDoneEvent) => any) {
        window.addEventListener('cfml.mod-list.enable.done', hander)
    }
    static off(hander: (this: Window, ev: ModListEnableDoneEvent) => any) {
        window.removeEventListener('cfml.mod-list.enable.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
    ) {
        super('cfml.mod-list.enable.done')
    }
}

export class ModListEnableFailEvent extends Event {
    static on(hander: (this: Window, ev: ModListEnableFailEvent) => any) {
        window.addEventListener('cfml.mod-list.enable.fail', hander)
    }
    static off(hander: (this: Window, ev: ModListEnableFailEvent) => any) {
        window.removeEventListener('cfml.mod-list.enable.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
        public readonly error: string
    ) {
        super('cfml.mod-list.enable.fail')
    }
}