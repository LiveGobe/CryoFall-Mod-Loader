exports.isInstanceOf = function isInstanceOf(constructor) {
    return it => it instanceof constructor
}