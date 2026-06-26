export function wasWritten(result: { changes: number }): boolean {
    return result.changes > 0;
}
