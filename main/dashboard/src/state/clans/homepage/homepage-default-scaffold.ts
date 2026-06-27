import type { HomepageComponent } from "./types.js";

const CANVAS_W = 960;
const CENTER_X = CANVAS_W / 2;

function seeded(
    id: string,
    kind: HomepageComponent["componentName"],
    cx: number,
    cy: number,
    w: number,
    h: number,
    payload: HomepageComponent["payload"],
    tokenOverrides: Record<string, string> = {},
): HomepageComponent {
    return {
        componentId: id,
        componentName: kind,
        canvasX: Math.round(cx - w / 2),
        canvasY: cy,
        canvasW: w,
        canvasH: h,
        zIndex: 0,
        payload,
        tokenOverrides,
        parentId: null,
    };
}

const TAGLINE_OVERRIDES: Record<string, string> = {
    "--font-size": "var(--fs-2xs)",
    "--text-align": "center",
    "--color": "var(--base-graphite-300)",
    "--letter-spacing": "var(--ls-wide)",
};

const ABOUT_HEADING_OVERRIDES: Record<string, string> = {
    "--font-size": "var(--fs-sm)",
    "--font-weight": "var(--fw-semi)",
    "--text-align": "center",
    "--color": "var(--base-gold-200)",
    "--letter-spacing": "var(--ls-wide)",
};

const ABOUT_BODY_OVERRIDES: Record<string, string> = {
    "--font-size": "var(--fs-2xs)",
    "--text-align": "center",
    "--color": "var(--base-cream-100)",
    "--line-height": "var(--lh-normal)",
};

const KPI_W = 120;
const KPI_H = 64;
const KPI_GAP = 16;
const KPI_ROW_Y = 152;
const KPI_ROW_TOTAL_W = KPI_W * 3 + KPI_GAP * 2;
const KPI_START_X = CENTER_X - KPI_ROW_TOTAL_W / 2 + KPI_W / 2;

function kpi(id: string, slot: number, label: string, value: string): HomepageComponent {
    const cx = KPI_START_X + slot * (KPI_W + KPI_GAP);
    return seeded(id, "kpi", cx, KPI_ROW_Y, KPI_W, KPI_H, { label, value });
}

export function defaultScaffold(): HomepageComponent[] {
    return [
        seeded(
            "default-icon",
            "image",
            CENTER_X,
            24,
            80,
            80,
            { imageKey: "__clan_icon__", imageVersion: 0 },
        ),
        seeded(
            "default-tagline",
            "paragraph",
            CENTER_X,
            116,
            480,
            20,
            { text: "{{clan.status}} clan · since {{clan.establishedYear}}" },
            TAGLINE_OVERRIDES,
        ),
        kpi("default-kpi-members", 0, "Members", "{{clan.memberCount}}"),
        kpi("default-kpi-established", 1, "Established", "{{clan.establishedYear}}"),
        kpi("default-kpi-status", 2, "Status", "{{clan.status}}"),
        seeded(
            "default-about-heading",
            "heading",
            CENTER_X,
            240,
            480,
            24,
            { text: "About" },
            ABOUT_HEADING_OVERRIDES,
        ),
        seeded(
            "default-about-body",
            "paragraph",
            CENTER_X,
            272,
            400,
            72,
            { text: "A clan of adventurers, builders, and friends — welcome." },
            ABOUT_BODY_OVERRIDES,
        ),
    ];
}

export function isDefaultIconKey(imageKey: string | undefined): boolean {
    return imageKey === "__clan_icon__";
}
