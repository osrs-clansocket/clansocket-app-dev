const PRIORITY_SECONDARY = 1;
const PRIORITY_TERTIARY = 2;

export function priorityWord(idx: number): string {
    if (idx === 0) return "primary";
    if (idx === PRIORITY_SECONDARY) return "secondary";
    if (idx === PRIORITY_TERTIARY) return "tertiary";
    return `#${idx + 1}`;
}
