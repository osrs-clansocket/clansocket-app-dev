export function reasonText(reason: string): string {
    if (reason === "row_hash_mismatch") {
        return "Row content no longer matches its stored hash. The row was modified after insert, or a code path wrote without rehashing.";
    }
    if (reason === "prev_hash_mismatch") {
        return "This row's prev_hash points at the wrong predecessor. A row was deleted, re-ordered, or inserted out of band.";
    }
    return `Unknown reason: ${reason}`;
}
