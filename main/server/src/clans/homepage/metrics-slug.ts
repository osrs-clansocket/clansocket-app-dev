const SLUG_REPLACE_RE = /[^a-z0-9]+/g;
const SLUG_COLLAPSE_RE = /_+/g;
const SLUG_TRIM_RE = /^_+|_+$/g;

export function slugify(value: string): string {
    return value.toLowerCase().replace(SLUG_REPLACE_RE, "_").replace(SLUG_COLLAPSE_RE, "_").replace(SLUG_TRIM_RE, "");
}

export function disambiguate(slug: string, seen: Set<string>): string {
    if (slug.length === 0) return "";
    if (!seen.has(slug)) {
        seen.add(slug);
        return slug;
    }
    let n = 2;
    while (seen.has(`${slug}_${n}`)) n++;
    const out = `${slug}_${n}`;
    seen.add(out);
    return out;
}

export function shortTableName(table: string): string {
    return table.startsWith("plugin_") ? table.slice("plugin_".length) : table;
}
