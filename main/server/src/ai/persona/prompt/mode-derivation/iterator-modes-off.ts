export function forModesOff(
    modes: Record<string, boolean>,
    table: Readonly<Record<string, readonly string[]>>,
    fn: (item: string) => void,
): void {
    for (const [modeKey, items] of Object.entries(table)) {
        if (modes[modeKey] !== false) continue;
        for (const item of items) fn(item);
    }
}
