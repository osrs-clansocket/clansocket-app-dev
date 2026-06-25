export function nextFloat(): number {
    return Math.random();
}

export function nextInt(maxExclusive: number): number {
    return Math.floor(Math.random() * maxExclusive);
}
