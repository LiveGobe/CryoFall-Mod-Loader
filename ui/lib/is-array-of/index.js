exports.isArrayOf = function isArrayOf(predicate) {
    return (it) => Array.isArray(it) && it.every(predicate)
}