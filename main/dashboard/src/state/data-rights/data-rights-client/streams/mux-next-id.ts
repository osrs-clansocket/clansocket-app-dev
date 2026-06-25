let nextIdCounter = 1;

export function nextId(): number {
    const v = nextIdCounter;
    nextIdCounter++;
    return v;
}
