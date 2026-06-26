import { anchor, div, paragraph, span, baseProps, textProps } from "../../../../factory";
import { rsnTag } from "../../../../factory/data-ops/identity/rsn-tag.js";
import type { Instance } from "../../../../factory";
import type { FlaggedMember, RunewatchCase } from "../../../../../state/clans/runewatch/runewatch-client.js";

const ISO_DATE_LEN = 10;
const EVIDENCE_MAX = 5;
const RUNEWATCH_CASE_URL_BASE = "https://runewatch.com/case/";
const HELM_ICON_SRC = "/resources/clan/runewatch_helm.webp";
const HELM_ALT = "RuneWatch flagged";

export const CARD_LIST_CLASS = "clans-manage__runewatch-card-list";
const CARD_CLASS = "clans-manage__runewatch-card";
const CARD_HARD_CLASS = "clans-manage__runewatch-card--hard";
const CARD_SOFT_CLASS = "clans-manage__runewatch-card--soft";
const CARD_HEAD_CLASS = "clans-manage__runewatch-card-head";
const CARD_BADGES_CLASS = "clans-manage__runewatch-card-badges";
const BADGE_CLASS = "clans-manage__runewatch-badge";
const BADGE_HARD_CLASS = "clans-manage__runewatch-badge--hard";
const BADGE_SOFT_CLASS = "clans-manage__runewatch-badge--soft";
const BADGE_SOURCE_CLASS = "clans-manage__runewatch-badge--source";
const CARD_BODY_CLASS = "clans-manage__runewatch-card-body";
const FIELD_LABEL_CLASS = "clans-manage__runewatch-field-label";
const FIELD_VALUE_CLASS = "clans-manage__runewatch-field-value";
const LINK_CLASS = "clans-manage__runewatch-link";

function runewatchCaseUrl(hash: string): string {
    return `${RUNEWATCH_CASE_URL_BASE}${hash}`;
}

function pickByTier<T>(tier: string, hard: T, soft: T): T {
    return tier === "hard" ? hard : soft;
}

function tierClass(tier: string): string {
    return pickByTier(tier, CARD_HARD_CLASS, CARD_SOFT_CLASS);
}

function tierBadgeClass(tier: string): string {
    return pickByTier(tier, BADGE_HARD_CLASS, BADGE_SOFT_CLASS);
}

function fmtDate(ms: number | null): string {
    if (ms === null || ms === 0) return "—";
    return new Date(ms).toISOString().slice(0, ISO_DATE_LEN);
}

function tierBadge(tier: string): Instance<HTMLElement> {
    return span(textProps([BADGE_CLASS, tierBadgeClass(tier)], tier === "hard" ? "Hard" : "Soft"));
}

function sourceBadge(source: string): Instance<HTMLElement> {
    return span(textProps([BADGE_CLASS, BADGE_SOURCE_CLASS], source));
}

function fieldLabel(text: string): Instance<HTMLElement> {
    return paragraph({ text, classes: [FIELD_LABEL_CLASS], context: null, meta: null });
}

function fieldValue(text: string): Instance<HTMLElement> {
    return paragraph({ text, classes: [FIELD_VALUE_CLASS], context: null, meta: null });
}

function caseLink(href: string, label: string): Instance<HTMLElement> {
    return anchor({
        href,
        classes: [LINK_CLASS],
        text: label,
        target: "_blank",
        rel: "noopener noreferrer",
        context: "open runewatch case",
        meta: ["external", "audit"],
    });
}

function buildCaseHead(rsn: string, tier: string, source: string): Instance<HTMLElement> {
    return div(baseProps([CARD_HEAD_CLASS]), [
        rsnTag({ rsn, iconSrc: HELM_ICON_SRC, iconAlt: HELM_ALT, context: null, meta: null }),
        div(baseProps([CARD_BADGES_CLASS]), [tierBadge(tier), sourceBadge(source)]),
    ]);
}

function buildCaseBody(c: RunewatchCase): Instance<HTMLElement> {
    const body = div(baseProps([CARD_BODY_CLASS]));
    body.addChild(fieldLabel("Reason"));
    body.addChild(fieldValue(c.reason));
    body.addChild(fieldLabel("Evidence"));
    body.addChild(fieldValue(c.evidence_rating !== null ? `${c.evidence_rating} / ${EVIDENCE_MAX}` : "—"));
    body.addChild(fieldLabel("Published"));
    body.addChild(fieldValue(fmtDate(c.published_at)));
    body.addChild(fieldLabel("Case"));
    if (c.hash) {
        const value = div(baseProps([FIELD_VALUE_CLASS]));
        value.addChild(caseLink(runewatchCaseUrl(c.hash), c.hash));
        body.addChild(value);
    } else {
        body.addChild(fieldValue("(WDR submission)"));
    }
    return body;
}

export function buildCaseCard(c: RunewatchCase): Instance<HTMLElement> {
    const card = div(baseProps([CARD_CLASS, tierClass(c.tier)]));
    card.setChildren(buildCaseHead(c.accused_rsn, c.tier, c.source), buildCaseBody(c));
    return card;
}

function buildFlaggedBody(m: FlaggedMember): Instance<HTMLElement> {
    const newest = m.cases[0];
    const body = div(baseProps([CARD_BODY_CLASS]));
    body.addChild(fieldLabel("Matches"));
    body.addChild(fieldValue(`${m.cases.length} case${m.cases.length === 1 ? "" : "s"}`));
    if (newest) {
        body.addChild(fieldLabel("Top reason"));
        body.addChild(fieldValue(newest.reason));
        if (newest.evidence_rating !== null) {
            body.addChild(fieldLabel("Evidence"));
            body.addChild(fieldValue(`${newest.evidence_rating} / ${EVIDENCE_MAX}`));
        }
        if (newest.hash) {
            body.addChild(fieldLabel("Case"));
            const value = div(baseProps([FIELD_VALUE_CLASS]));
            value.addChild(caseLink(runewatchCaseUrl(newest.hash), newest.hash));
            body.addChild(value);
        }
    }
    return body;
}

export function buildFlaggedCard(m: FlaggedMember): Instance<HTMLElement> {
    const tier = m.cases.some((c) => c.tier === "hard") ? "hard" : "soft";
    const source = m.cases[0]?.source ?? "RW";
    const card = div(baseProps([CARD_CLASS, tierClass(tier)]));
    card.setChildren(buildCaseHead(m.member_name, tier, source), buildFlaggedBody(m));
    return card;
}

export function filterCases(cases: RunewatchCase[], query: string): RunewatchCase[] {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return cases;
    return cases.filter((c) => c.rsn_normalized.includes(q) || c.reason.toLowerCase().includes(q));
}
