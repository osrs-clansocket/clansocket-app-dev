const ROW_COLOR_TOKENS: readonly string[] = [
    "var(--base-gold-300)",
    "var(--base-azure-300)",
    "var(--base-forest-300)",
    "var(--base-ember-300)",
    "var(--base-amber-300)",
    "var(--base-silver-300)",
];

export function rowColor(row: number): string {
    const n = ROW_COLOR_TOKENS.length;
    const idx = ((row % n) + n) % n;
    return ROW_COLOR_TOKENS[idx]!;
}
