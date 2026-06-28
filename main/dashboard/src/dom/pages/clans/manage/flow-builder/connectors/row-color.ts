const ROW_COLOR_COUNT = 30;

export function rowColor(row: number): string {
    const n = ROW_COLOR_COUNT;
    const idx = ((row % n) + n) % n;
    const padded = String(idx + 1).padStart(2, "0");
    return `var(--flow-row-color-${padded})`;
}
