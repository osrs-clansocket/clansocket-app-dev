export function makeTriggerBus(): { subscribe: (l: () => void) => () => void; notify: () => void } {
    const listeners = new Set<() => void>();
    return {
        subscribe: (l) => {
            listeners.add(l);
            return () => {
                listeners.delete(l);
            };
        },
        notify: () => {
            for (const l of listeners) l();
        },
    };
}
