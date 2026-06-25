import { type Instance } from "../../core";

export interface OverlayContext {
    host: Instance;
    trigger: HTMLElement;
    anchor: HTMLElement;
    prevVisibility: string;
    resolve: (v: boolean) => void;
}

export interface OverlayState {
    settled: boolean;
    actionsRef: Instance | null;
}
