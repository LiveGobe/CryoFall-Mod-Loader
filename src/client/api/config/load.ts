declare global {
    interface Window {
        addEventListener(eventName: 'cfml.config.load', handler: (this: Window, ev: ConfigLoadEvent) => any): void
        removeEventListener(eventName: 'cfml.config.load', handler: (this: Window, ev: ConfigLoadEvent) => any): void
        addEventListener(eventName: 'cfml.config.load.done', handler: (this: Window, ev: ConfigLoadDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.config.load.done', handler: (this: Window, ev: ConfigLoadDoneEvent) => any): void
        addEventListener(eventName: 'cfml.config.load.fail', handler: (this: Window, ev: ConfigLoadFailEvent) => any): void
        removeEventListener(eventName: 'cfml.config.load.fail', handler: (this: Window, ev: ConfigLoadFailEvent) => any): void
    }
}


export class ConfigLoadEvent extends Event {
    static integrityId: string | undefined
    static async dispatch() {
        ConfigLoadEvent.integrityId = crypto.randomUUID()
        const actionEvent = new ConfigLoadEvent(ConfigLoadEvent.integrityId)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.Config.load()
        if (actionEvent.integrityId !== ConfigLoadEvent.integrityId) {
            return
        }
        if (res.success) {
            window.dispatchEvent(new ConfigLoadDoneEvent(ConfigLoadEvent.integrityId, res.payload))
        } else {
            window.dispatchEvent(new ConfigLoadFailEvent(ConfigLoadEvent.integrityId, res.error))
        }
    }
    static on(hander: (this: Window, ev: ConfigLoadEvent) => any) {
        window.addEventListener('cfml.config.load', hander)
    }
    static off(hander: (this: Window, ev: ConfigLoadEvent) => any) {
        window.removeEventListener('cfml.config.load', hander)
    }
    constructor(
        public readonly integrityId: string,
    ) {
        super('cfml.config.load')
    }
}

export class ConfigLoadDoneEvent extends Event {
    static on(hander: (this: Window, ev: ConfigLoadDoneEvent) => any) {
        window.addEventListener('cfml.config.load.done', hander)
    }
    static off(hander: (this: Window, ev: ConfigLoadDoneEvent) => any) {
        window.removeEventListener('cfml.config.load.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly payload: CryoFallModLoader.Config.ConfigData
    ) {
        super('cfml.config.load.done')
    }
}

export class ConfigLoadFailEvent extends Event {
    static on(hander: (this: Window, ev: ConfigLoadFailEvent) => any) {
        window.addEventListener('cfml.config.load.fail', hander)
    }
    static off(hander: (this: Window, ev: ConfigLoadFailEvent) => any) {
        window.removeEventListener('cfml.config.load.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly error: string
    ) {
        super('cfml.config.load.fail')
    }
}
