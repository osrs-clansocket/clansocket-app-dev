import { div, heading, image, span, type Instance, baseProps, textProps } from "../../../../factory";

export const ROOT_CLASS = "clans-manage__wise-old-man";
export const HEAD_CLASS = "clans-manage__wise-old-man-head";
export const BRAND_ICON_CLASS = "clans-manage__wise-old-man-brand-icon";
export const TITLE_CLASS = "clans-manage__wise-old-man-title";
export const LOADING_CLASS = "clans-manage__wise-old-man-loading";
export const HINT_CLASS = "clans-manage__wise-old-man-hint";
export const FORM_CLASS = "clans-manage__wise-old-man-form";
export const FORM_FIELD_CLASS = "clans-manage__wise-old-man-field";
export const FORM_LABEL_CLASS = "clans-manage__wise-old-man-label";
export const SUBMIT_BTN_CLASS = "clans-manage__wise-old-man-submit";
export const STATUS_LINE_CLASS = "clans-manage__wise-old-man-status-line";

export const SECTION_CLASS = "clans-manage__wise-old-man-section";
export const SECTION_TITLE_CLASS = "clans-manage__wise-old-man-section-title";
export const IDENTITY_NAME_CLASS = "clans-manage__wise-old-man-identity-name";
export const IDENTITY_DESC_CLASS = "clans-manage__wise-old-man-identity-desc";
export const META_ROW_CLASS = "clans-manage__wise-old-man-meta-row";
export const META_CHIP_CLASS = "clans-manage__wise-old-man-meta-chip";
export const META_LABEL_CLASS = "clans-manage__wise-old-man-meta-label";
export const META_VALUE_CLASS = "clans-manage__wise-old-man-meta-value";
export const VERIFIED_CHIP_CLASS = "clans-manage__wise-old-man-verified";
export const EXTERNAL_LINK_CLASS = "clans-manage__wise-old-man-external-link";
export const MEMBERS_TABLE_CLASS = "clans-manage__wise-old-man-members";
export const MEMBER_ROW_CLASS = "clans-manage__wise-old-man-member-row";
export const MEMBER_ROLE_CLASS = "clans-manage__wise-old-man-member-role";
export const MEMBER_NAME_CLASS = "clans-manage__wise-old-man-member-name";
export const MEMBER_META_CLASS = "clans-manage__wise-old-man-member-meta";
export const INTERNAL_GRID_CLASS = "clans-manage__wise-old-man-internal";
export const INTERNAL_ROW_CLASS = "clans-manage__wise-old-man-internal-row";
export const INTERNAL_LABEL_CLASS = "clans-manage__wise-old-man-internal-label";
export const INTERNAL_VALUE_CLASS = "clans-manage__wise-old-man-internal-value";
export const ACTIONS_CLASS = "clans-manage__wise-old-man-actions";
export const ACTION_HOST_CLASS = "clans-manage__wise-old-man-action-host";
export const FEEDBACK_CLASS = "clans-manage__wise-old-man-feedback";
export const FUSED_CLASS = "clans-manage__wise-old-man-fused";
export const LINKER_VALUE_CLASS = "clans-manage__wise-old-man-linker-value";

const BRAND_ICON_SRC = "/resources/clan/wise_old_man.webp";
const BRAND_TITLE = "Wise Old Man";
export const WOM_GROUP_URL_BASE = "https://wiseoldman.net/groups/";
export const LOADING_TEXT = "Loading WoM link status…";
export const DETAILS_LOADING_TEXT = "Loading group details from WoM…";
export const NOT_LINKED_LEDE =
    "Paste your clan's WoM group ID + verification code (from wiseoldman.net). API key optional, raises rate limit.";
export const SUBMIT_LINK_BTN = "Link";
export const RELINK_BTN = "Re-link";
export const UNLINK_BTN = "Unlink";
export const SYNC_NOW_BTN = "Sync now";
export const UPDATE_NOW_BTN = "Update WoM";
export const OPEN_WOM_BTN = "Open on wiseoldman.net";
export const ERR_REQUIRED = "Group ID (positive number) and verification code are required.";
export const STATUS_LINKING = "Linking…";
export const STATUS_LINKED = "Linked.";
export const SYNC_RUNNING = "Sync triggered. Updates land over the next few minutes.";
export const SYNC_GATED_PREFIX = "Already synced. Next sync available ";
export const SYNC_UNAVAILABLE = "Sync failed.";
export const UPDATE_RUNNING = "Asked WoM to refresh all members from Jagex hiscores. May take several minutes.";
export const UPDATE_FAILED = "Update request failed.";
export const UPDATE_QUEUED_BTN = "Update queued";
export const UPDATE_IN_FLIGHT_BTN = "Updating WoM…";
export const UPDATE_OUTAGE_BTN = "WoM down — retrying";
export const UNLINK_DONE = "Unlinked.";
export const UNLINK_CANCEL_CTX = "cancel unlinking the WoM group";
export const UNLINK_CONFIRM_CTX = "confirm unlinking the WoM group (revokes credentials)";

const ISO_DATE_END = 10;
export const NONE_VALUE = "—";
const MINS_PER_HOUR = 60;
const MINS_PER_DAY = 60 * 24;
const MS_PER_MIN = 60_000;

export function msToDate(ms: number | null): string {
    if (ms === null) return NONE_VALUE;
    return new Date(ms).toISOString().slice(0, ISO_DATE_END);
}

export function isoToDate(iso: string | null | undefined): string {
    if (typeof iso !== "string" || iso.length === 0) return NONE_VALUE;
    return iso.slice(0, ISO_DATE_END);
}

export function formatEta(targetMs: number, nowMs: number = Date.now()): string {
    const diffMs = targetMs - nowMs;
    if (diffMs <= 0) return "now";
    const minutes = Math.round(diffMs / MS_PER_MIN);
    if (minutes < MINS_PER_HOUR) return `in ${minutes} min`;
    if (minutes < MINS_PER_DAY) return `in ${Math.round(minutes / MINS_PER_HOUR)} h`;
    return `in ${Math.round(minutes / MINS_PER_DAY)} d`;
}

export function brandHead(): Instance {
    return div(baseProps([HEAD_CLASS]), [
        image({ src: BRAND_ICON_SRC, alt: BRAND_TITLE, classes: [BRAND_ICON_CLASS], context: null, meta: null }),
        heading("h2", { classes: [TITLE_CLASS], text: BRAND_TITLE, context: null, meta: null }),
    ]);
}

export interface ChipRefs {
    instance: Instance;
    valueSpan: Instance;
}

export function makeChip(label: string): ChipRefs {
    const valueSpan = span(textProps([META_VALUE_CLASS], ""));
    const instance = div(baseProps([META_CHIP_CLASS]), [span(textProps([META_LABEL_CLASS], label)), valueSpan]);
    return { instance, valueSpan };
}
