const GATE_MS = 100;

let lastClickAt = 0;

export function passesClickGate(): boolean {
    const now = performance.now();
    if (now - lastClickAt < GATE_MS) return false;
    lastClickAt = now;
    return true;
}
