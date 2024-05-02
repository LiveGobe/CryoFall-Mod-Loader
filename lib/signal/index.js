// @ts-check

export function createSignal() {
    const listeners = new Set()
    function signal(data) {
        Array.from(listeners).forEach(listener => {
            try {
                listener(data)
            } catch (e) {
                console.error(e)
            }
        })
    }
    signal.listen = function listen(listener) {
        listeners.add(listener)
    }
    signal.listenOnce = function listenOnce(listener) {
        listeners.add(function proxy(data) {
            try {
                listener(data)
            } catch (e) {
                console.error(e)
            }
            signal.unlisten(proxy)
        })
    }
    signal.unlisten = function unlisten(listener) {
        listeners.delete(listener)
    }
    signal.unlistenAll = function unlistenAll() {
        listeners.clear()
    }
    return signal
}
