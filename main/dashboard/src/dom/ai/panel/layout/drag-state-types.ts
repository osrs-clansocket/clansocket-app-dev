export interface DragState {
    startY: number;
    startH: number;
    startDistFromBottom: number;
    startScrollHeight: number;
    pendingY: number;
    lastAppliedY: number;
    prevAppliedH: number;
    applyScrollFollow: (deltaPx: number) => void;
    unsub: (() => void) | null;
}

export interface DragTargets {
    bar: HTMLElement;
    handle: HTMLElement;
    history: HTMLElement;
}
