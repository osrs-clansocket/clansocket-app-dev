import { bracketedBy, isNumericLiteral } from "./predicate-frontmatter.js";

const LITERAL_VALUES: Record<string, unknown> = { true: true, false: false, null: null };

const SHAPE_HANDLERS: ReadonlyArray<{
    pairs: ReadonlyArray<readonly [string, string]>;
    handle: (s: string) => unknown;
}> = [
    {
        pairs: [
            ["[", "]"],
            ["{", "}"],
        ],
        handle: (s) => {
            try {
                return JSON.parse(s);
            } catch {
                return s;
            }
        },
    },
    {
        pairs: [
            ['"', '"'],
            ["'", "'"],
        ],
        handle: (s) => s.slice(1, -1),
    },
];

export function parseFrontmatterValue(raw: string): unknown {
    const s = raw.trim();
    if (Object.prototype.hasOwnProperty.call(LITERAL_VALUES, s)) return LITERAL_VALUES[s];
    if (isNumericLiteral(s)) return Number(s);
    for (const { pairs, handle } of SHAPE_HANDLERS) {
        if (pairs.some(([a, b]) => bracketedBy(s, a, b))) return handle(s);
    }
    return s;
}
