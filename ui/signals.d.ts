import { Signal } from "../lib/signal";

export declare const setModEnabled: Signal<{ modID: string, enabled: boolean }>
export declare const deleteMod: Signal<{ modID: string }>
export declare const modeChangedSignal: Signal<string>