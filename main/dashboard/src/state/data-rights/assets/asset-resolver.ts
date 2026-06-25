import { RESOLVERS } from "./asset-resolver-registry.js";

export function resolveColumnAsset(
    table: string,
    column: string,
    value: unknown,
    row: Record<string, unknown>,
): string | null {
    const fn = RESOLVERS[column];
    if (fn === undefined) return null;
    return fn(table, column, value, row);
}
