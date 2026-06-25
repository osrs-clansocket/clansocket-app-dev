const MAX_FRAME_DT_MS = 100;

type Tick = (timeMs: number, deltaMs: number) => void;

const subs = new Set<Tick>();
let rafId = 0;
let prevT = -1;
let paused = false;

function rafStep(t: number): void {
    rafId = 0;
    const dt = prevT >= 0 ? Math.min(t - prevT, MAX_FRAME_DT_MS) : 0;
    prevT = t;
    for (const fn of subs) fn(t, dt);
    if (subs.size > 0 && !paused) rafId = requestAnimationFrame(rafStep);
}

function rafEnsure(): void {
    if (paused || rafId !== 0 || subs.size === 0) return;
    rafId = requestAnimationFrame(rafStep);
}

function rafHalt(): void {
    if (rafId === 0) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
    prevT = -1;
}

function rafSubscribe(fn: Tick): () => void {
    subs.add(fn);
    rafEnsure();
    return (): void => {
        subs.delete(fn);
        if (subs.size === 0) rafHalt();
    };
}

function rafSetPaused(next: boolean): void {
    if (paused === next) return;
    paused = next;
    if (paused) rafHalt();
    else rafEnsure();
}

document.addEventListener("visibilitychange", () => rafSetPaused(document.hidden));

const rafScheduler = { subscribe: rafSubscribe, setPaused: rafSetPaused };

export function isHidden(): boolean {
    return document.hidden;
}

export { rafScheduler };
