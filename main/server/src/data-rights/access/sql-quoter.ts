export { buildSizeExpr, projectionColumns } from "./sql-column-builders.js";

export function quoteIdent(name: string): string {
    return `"${name.split('"').join('""')}"`;
}

export function placeholders(n: number): string {
    return Array.from({ length: n }, () => "?").join(", ");
}
