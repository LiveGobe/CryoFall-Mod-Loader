declare global {
    interface Window {
        addEventListener(eventName: 'cfml.config.load', handler: (this: Window, ev: ConfigSaveEvent) => any): void
        removeEventListener(eventName: 'cfml.config.load', handler: (this: Window, ev: ConfigSaveEvent) => any): void
        addEventListener(eventName: 'cfml.config.load.done', handler: (this: Window, ev: ConfigSaveDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.config.load.done', handler: (this: Window, ev: ConfigSaveDoneEvent) => any): void
        addEventListener(eventName: 'cfml.config.load.fail', handler: (this: Window, ev: ConfigSaveFailEvent) => any): void
        removeEventListener(eventName: 'cfml.config.load.fail', handler: (this: Window, ev: ConfigSaveFailEvent) => any): void
    }
}

export class ConfigSaveEvent extends Event {
    static integrityId: string | undefined
    static async dispatch(data: CryoFallModLoader.Config.ConfigData) {
        ConfigSaveEvent.integrityId = crypto.randomUUID()
        const actionEvent = new ConfigSaveEvent(ConfigSaveEvent.integrityId)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.Config.save(data)
        if (actionEvent.integrityId !== ConfigSaveEvent.integrityId) {
            return
        }
        if (res.success) {
            window.dispatchEvent(new ConfigSaveDoneEvent(ConfigSaveEvent.integrityId))
        } else {
            window.dispatchEvent(new ConfigSaveFailEvent(ConfigSaveEvent.integrityId, res.error))
        }
    }
    static on(hander: (this: Window, ev: ConfigSaveEvent) => any) {
        window.addEventListener('cfml.config.load', hander)
    }
    static off(hander: (this: Window, ev: ConfigSaveEvent) => any) {
        window.removeEventListener('cfml.config.load', hander)
    }
    constructor(
        public readonly integrityId: string,
    ) {
        super('cfml.config.load')
    }
}

export class ConfigSaveDoneEvent extends Event {
    static on(hander: (this: Window, ev: ConfigSaveDoneEvent) => any) {
        window.addEventListener('cfml.config.load.done', hander)
    }
    static off(hander: (this: Window, ev: ConfigSaveDoneEvent) => any) {
        window.removeEventListener('cfml.config.load.done', hander)
    }
    constructor(
        public readonly integrityId: string,
    ) {
        super('cfml.config.load.done')
    }
}

export class ConfigSaveFailEvent extends Event {
    static on(hander: (this: Window, ev: ConfigSaveFailEvent) => any) {
        window.addEventListener('cfml.config.load.fail', hander)
    }
    static off(hander: (this: Window, ev: ConfigSaveFailEvent) => any) {
        window.removeEventListener('cfml.config.load.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly error: string
    ) {
        super('cfml.config.load.fail')
    }
}
