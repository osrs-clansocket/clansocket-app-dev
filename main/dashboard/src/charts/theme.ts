import type { ChartTheme } from "./types-theme.js";

interface ThemeTokens {
    gold500: string;
    gold300: string;
    gold200: string;
    dangerStrong: string;
    ember200: string;
    dangerFg: string;
    bronze: string;
    parchment: string;
    textMuted: string;
    fontBody: string;
    fontHeading: string;
}

const TOKEN_DEFS: Array<[keyof ThemeTokens, string, string]> = [
    ["gold500", "--base-gold-500", "#c9a84c"],
    ["gold300", "--base-gold-300", "#e4c97a"],
    ["gold200", "--base-gold-200", "#efd9a3"],
    ["dangerStrong", "--base-ember-300", "#a55050"],
    ["ember200", "--base-ember-200", "#c47878"],
    ["dangerFg", "--base-ember-100", "#dca4a4"],
    ["bronze", "--clr-rank-bronze", "#a07a3c"],
    ["parchment", "--base-cream-100", "#e8d9b8"],
    ["textMuted", "--base-graphite-300", "#8a7e68"],
    ["fontBody", "--font-body", '"Cascadia Code", monospace'],
    ["fontHeading", "--font-heading", '"Cascadia Code", monospace'],
];

const GRID_COLOR = "rgba(201, 168, 76, 0.12)";
const DEFAULT_FONT_SIZE = 10;

let cached: ChartTheme | null = null;

function readThemeVar(root: CSSStyleDeclaration, name: string, fallback: string): string {
    const v = root.getPropertyValue(name).trim();
    return v || fallback;
}

function readThemeTokens(root: CSSStyleDeclaration): ThemeTokens {
    const out = {} as ThemeTokens;
    for (const [key, varName, fallback] of TOKEN_DEFS) {
        out[key] = readThemeVar(root, varName, fallback);
    }
    return out;
}

function readOverlay(root: CSSStyleDeclaration, name: string): string {
    return root.getPropertyValue(name).trim();
}

function applyOverlays(base: ChartTheme, root: CSSStyleDeclaration): ChartTheme {
    const primary = readOverlay(root, "--chart-primary") || readOverlay(root, "--color") || base.primary;
    const text = readOverlay(root, "--chart-text") || readOverlay(root, "--color") || base.text;
    const textMuted = readOverlay(root, "--chart-text-muted") || base.textMuted;
    const grid = readOverlay(root, "--chart-grid") || readOverlay(root, "--border-color") || base.grid;
    const fontBody = readOverlay(root, "--chart-font-family") || readOverlay(root, "--font-family") || base.fontBody;
    const palette = [primary, base.secondary, text, base.statusWarn, base.primary, base.statusDanger, base.fontBody, textMuted];
    return { ...base, primary, text, textMuted, grid, palette, fontBody };
}

function buildTheme(t: ThemeTokens): ChartTheme {
    return {
        palette: [t.gold500, t.dangerStrong, t.parchment, t.bronze, t.gold300, t.ember200, t.gold200, t.dangerFg],
        text: t.parchment,
        textMuted: t.textMuted,
        grid: GRID_COLOR,
        primary: t.gold500,
        secondary: t.dangerStrong,
        statusOk: t.gold500,
        statusWarn: t.bronze,
        statusDanger: t.dangerStrong,
        fontBody: t.fontBody,
        fontHeading: t.fontHeading,
    };
}

function baseTheme(): ChartTheme {
    if (cached !== null) return cached;
    cached = buildTheme(readThemeTokens(getComputedStyle(document.documentElement)));
    return cached;
}

function getChartTheme(el?: Element | null): ChartTheme {
    const base = baseTheme();
    if (el === undefined || el === null) return base;
    return applyOverlays(base, getComputedStyle(el));
}

interface ThemeDefaultsHost {
    defaults: { font: { family?: string; size?: number }; color?: string };
}

export function applyChartDefaults(host: ThemeDefaultsHost): void {
    const theme = baseTheme();
    host.defaults.font.family = theme.fontBody;
    host.defaults.font.size = DEFAULT_FONT_SIZE;
    host.defaults.color = theme.text;
}

export { getChartTheme };
