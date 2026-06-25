const SVG_MIME = "image/svg+xml";
const PATH_SELECTOR = "path";
const ATTR_D = "d";

function extractPathD(node: Node): string | null {
    if (!(node instanceof Element)) return null;
    const d = node.getAttribute(ATTR_D);
    if (d === null) return null;
    const trimmed = d.trim();
    if (trimmed.length === 0) return null;
    return trimmed;
}

export function parseSvgDoc(svgText: string): string[] {
    if (typeof DOMParser === "undefined") return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, SVG_MIME);
    if (doc.querySelector("parsererror") !== null) return [];
    const out: string[] = [];
    for (const node of doc.querySelectorAll(PATH_SELECTOR)) {
        const trimmed = extractPathD(node);
        if (trimmed !== null) out.push(trimmed);
    }
    return out;
}
