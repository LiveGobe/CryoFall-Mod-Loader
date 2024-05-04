/// <reference path="./index.d.ts" />

export function isInstanceOf(constructor) {
    return it => it instanceof constructor
}