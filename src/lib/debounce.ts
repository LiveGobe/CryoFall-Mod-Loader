
export function debounce<A extends any[]>(callback: (...args: A) => any, ms: number) {
    let timerId = -1
    function debounced(...args: A) {
        if (!~timerId) {
            window.clearTimeout(timerId)
        }
        timerId = window.setTimeout((...args: A) => {
            callback(...args)
            timerId = -1
        }, ms, ...args)
    }
    debounced.cancel = () => {
        if (!~timerId) {
            window.clearTimeout(timerId)
            timerId = -1
        }
    }
    debounced.runNow = (...args: A) => {
        if (!~timerId) {
            window.clearTimeout(timerId)
        }
        callback(...args)
        timerId = -1
    }
    return debounced
}
