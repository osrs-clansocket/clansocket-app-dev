const RENDERABLE_STRING_KEYS = ["title", "description", "url"] as const;
const RENDERABLE_OBJECT_KEYS = ["author", "footer", "thumbnail", "image"] as const;

function anyKeyMatches(o: Record<string, unknown>, keys: readonly string[], matches: (v: unknown) => boolean): boolean {
    for (const k of keys) {
        if (matches(o[k])) return true;
    }
    return false;
}

export function isEmbedRenderable(embed: object): boolean {
    const o = embed as Record<string, unknown>;
    return (
        anyKeyMatches(o, RENDERABLE_STRING_KEYS, (v) => typeof v === "string" && v.length > 0) ||
        anyKeyMatches(o, RENDERABLE_OBJECT_KEYS, (v) => v !== undefined) ||
        Array.isArray(o.fields)
    );
}
