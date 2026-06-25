export function placeholdersFor(n: number): string {
    return Array(n).fill("?").join(",");
}
