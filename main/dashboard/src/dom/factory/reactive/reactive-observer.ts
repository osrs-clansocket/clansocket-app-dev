export interface Observer {
    run: () => void;
    deps: Set<Set<Observer>>;
    isMemo: boolean;
    dirty: boolean;
    active: boolean;
    memoSubs: Set<Observer> | null;
    value?: unknown;
}

export interface Disposable {
    dispose(): void;
}

export interface EffectOwner {
    trackDispose(d: Disposable): void;
}
