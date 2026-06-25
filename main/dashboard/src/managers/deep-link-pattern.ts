export type Params = Record<string, string | undefined>;

const KIND_LITERAL = "literal";
const KIND_PARAM = "param";
type SegmentKind = typeof KIND_LITERAL | typeof KIND_PARAM;

export interface PatternSegment {
    kind: SegmentKind;
    value: string;
    optional: boolean;
}

const PARAM_PREFIX = ":";
const OPTIONAL_SUFFIX = "?";

export function splitPath(path: string): string[] {
    return path.split("/").filter((s) => s.length > 0);
}

export function compilePattern(pattern: string): PatternSegment[] {
    return splitPath(pattern).map((seg) => {
        const isParam = seg.startsWith(PARAM_PREFIX);
        const isOptional = seg.endsWith(OPTIONAL_SUFFIX);
        const raw = isParam ? seg.slice(1) : seg;
        const value = isOptional ? raw.slice(0, -1) : raw;
        return { value, kind: isParam ? KIND_PARAM : KIND_LITERAL, optional: isOptional };
    });
}

function matchSegment(seg: PatternSegment, part: string | undefined, params: Params): boolean {
    if (part === undefined) return seg.optional;
    if (seg.kind === KIND_LITERAL) return seg.value === part;
    params[seg.value] = decodeURIComponent(part);
    return true;
}

export function matchRoute(segments: PatternSegment[], parts: string[]): Params | null {
    if (parts.length > segments.length) return null;
    const params: Params = {};
    for (let i = 0; i < segments.length; i++) {
        if (!matchSegment(segments[i]!, parts[i], params)) return null;
    }
    return params;
}
