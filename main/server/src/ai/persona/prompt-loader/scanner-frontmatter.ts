export function atEnd(s: string, i: number): boolean {
    return i === s.length;
}

export function scanDigits(s: string, start: number): number {
    let i = start;
    while (i < s.length && s[i] >= "0" && s[i] <= "9") i++;
    return i;
}
