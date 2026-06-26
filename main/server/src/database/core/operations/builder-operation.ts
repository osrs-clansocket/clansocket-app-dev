export function sqlPlaceholders(n: number): string {
    return Array.from({ length: n }, () => "?").join(",");
}

function eqClause(k: string): string {
    return `${k} = ?`;
}

export function buildWhereClause(keys: readonly string[]): string {
    return keys.map(eqClause).join(" AND ");
}
