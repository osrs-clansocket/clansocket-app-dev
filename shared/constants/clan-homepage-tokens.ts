export const COMPONENT_KINDS = ["heading", "paragraph", "image", "spacer", "container", "kpi"] as const;
export type ComponentKind = (typeof COMPONENT_KINDS)[number];

export const BASE_COLOR_FAMILIES = ["gold", "graphite", "cream", "ember", "forest"] as const;
export const BASE_COLOR_TIERS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

function expandBaseColors(): string[] {
    const out: string[] = [];
    for (const fam of BASE_COLOR_FAMILIES) {
        for (const tier of BASE_COLOR_TIERS) out.push(`var(--base-${fam}-${tier})`);
    }
    return out;
}

export const COLOR_TOKENS: readonly string[] = expandBaseColors();
export const BACKGROUND_TOKENS: readonly string[] = [
    ...COLOR_TOKENS,
    "var(--gradient-surface)",
    "var(--gradient-surface-opaque)",
    "transparent",
];
export const SP_TIERS = ["0", "0h", "1", "1h", "2", "2h", "3", "4", "6", "8"] as const;
export const SPACING_TOKENS: readonly string[] = [
    ...SP_TIERS.map((t) => `var(--sp-${t})`),
    "var(--sp-hairline)",
    "0",
];
export const RADIUS_TOKENS: readonly string[] = [
    "var(--radius-md)",
    "var(--radius-pill)",
    "var(--radius-full)",
    "0",
];
export const FS_TIERS = ["3xs", "2xs", "xs", "sm", "base", "md", "lg", "xl", "2xl"] as const;
export const FONT_SIZE_TOKENS: readonly string[] = FS_TIERS.map((t) => `var(--fs-${t})`);
export const FONT_WEIGHT_TOKENS: readonly string[] = [
    "var(--fw-thin)",
    "var(--fw-light)",
    "var(--fw-medium)",
    "var(--fw-semi)",
    "var(--fw-bold)",
];
export const FONT_FAMILY_TOKENS: readonly string[] = [
    "var(--font-heading)",
    "var(--font-body)",
    "var(--font-mono)",
];
export const TEXT_ALIGN_VALUES: readonly string[] = ["start", "center", "end"];
export const LETTER_SPACING_TOKENS: readonly string[] = [
    "var(--ls-tight)",
    "var(--ls-normal)",
    "var(--ls-wide)",
];
export const LINE_HEIGHT_TOKENS: readonly string[] = [
    "var(--lh-flat)",
    "var(--lh-snug)",
    "var(--lh-normal)",
    "var(--lh-loose)",
];
export const OPACITY_TOKENS: readonly string[] = [
    "var(--opacity-faint)",
    "var(--opacity-medium)",
    "var(--opacity-solid)",
    "1",
];
export const SHADOW_TOKENS: readonly string[] = ["var(--shadow-glow)", "var(--shadow-card)", "none"];
export const BACKDROP_FILTER_VALUES: readonly string[] = [
    "blur(var(--blur-sm))",
    "blur(var(--blur-md))",
    "blur(var(--blur-lg))",
    "none",
];
export const FLEX_DIRECTION_VALUES: readonly string[] = ["row", "column"];

export const ALLOWED_TOKENS_BY_PROPERTY: Record<string, readonly string[]> = {
    "--color": COLOR_TOKENS,
    "--background": BACKGROUND_TOKENS,
    "--padding": SPACING_TOKENS,
    "--margin": SPACING_TOKENS,
    "--border-radius": RADIUS_TOKENS,
    "--border-color": COLOR_TOKENS,
    "--font-size": FONT_SIZE_TOKENS,
    "--font-weight": FONT_WEIGHT_TOKENS,
    "--font-family": FONT_FAMILY_TOKENS,
    "--text-align": TEXT_ALIGN_VALUES,
    "--letter-spacing": LETTER_SPACING_TOKENS,
    "--line-height": LINE_HEIGHT_TOKENS,
    "--opacity": OPACITY_TOKENS,
    "--shadow": SHADOW_TOKENS,
    "--backdrop-filter": BACKDROP_FILTER_VALUES,
    "--flex-direction": FLEX_DIRECTION_VALUES,
    "--kpi-label-color": COLOR_TOKENS,
    "--kpi-value-color": COLOR_TOKENS,
};

export const CANVAS_BOUND_MIN = 0;
export const CANVAS_BOUND_MAX = 9999;
export const Z_INDEX_MIN = -100;
export const Z_INDEX_MAX = 100;
export const TEXT_MAX_LENGTH = 4000;
export const IMAGE_KEY_REGEX = /^[a-z0-9-]{1,32}$/;
export const COMPONENT_ID_REGEX = /^[a-z0-9-]{1,40}$/;

export function isAllowedComponentKind(kind: string): kind is ComponentKind {
    return (COMPONENT_KINDS as readonly string[]).includes(kind);
}

const COLOR_PROPERTIES: ReadonlySet<string> = new Set([
    "--color",
    "--background",
    "--border-color",
    "--kpi-label-color",
    "--kpi-value-color",
]);
const HEX_RGB_LEN = 7;
const HEX_RGBA_LEN = 9;
const CODE_0 = 48;
const CODE_9 = 57;
const CODE_UPPER_A = 65;
const CODE_UPPER_F = 70;
const CODE_LOWER_A = 97;
const CODE_LOWER_F = 102;

export function isColorProperty(prop: string): boolean {
    return COLOR_PROPERTIES.has(prop);
}

function isHexChar(c: number): boolean {
    if (c >= CODE_0 && c <= CODE_9) return true;
    if (c >= CODE_UPPER_A && c <= CODE_UPPER_F) return true;
    return c >= CODE_LOWER_A && c <= CODE_LOWER_F;
}

export function isHexColor(value: string): boolean {
    if (value.length !== HEX_RGB_LEN && value.length !== HEX_RGBA_LEN) return false;
    if (value.charCodeAt(0) !== "#".charCodeAt(0)) return false;
    for (let i = 1; i < value.length; i++) {
        if (!isHexChar(value.charCodeAt(i))) return false;
    }
    return true;
}
