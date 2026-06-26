import {
    div,
    effect,
    image,
    rsnTag,
    scheduleText,
    signal,
    span,
    wireClick,
    type Instance,
    baseProps,
    textProps,
} from "../../../../factory";
import { IS_ACTIVE_CLASS } from "../../../../../shared/constants/state-modifier-constants.js";
import type { PluginConfigMember, PluginConfigState } from "../../../../../state/clans/plugin-config/client.js";
import {
    GLOBAL_SCOPE,
    GLOBAL_TITLE_TEXT,
    type Scope,
} from "../../../../../shared/constants/plugin-config/scope-constants.js";

const ROSTER_CARD_CLASS = "clans-manage__config-roster-card";
const ROSTER_CARD_BODY_CLASS = "clans-manage__config-roster-card-body";
const ROSTER_CARD_GLOBE_CLASS = "clans-manage__config-roster-card-globe";
const ROSTER_CARD_GLOBAL_LABEL_CLASS = "clans-manage__config-roster-card-global-label";
const ROSTER_CARD_MARKER_CLASS = "clans-manage__config-roster-card-marker";
const GLOBE_ICON_SRC = "/resources/osrs/game_tab/clan_channel.webp";
const GLOBE_ICON_ALT = "Globe";
const CUSTOM_MARKER_TEXT = "custom";

function rosterCardBody(member: PluginConfigMember | null): Instance {
    if (member === null) {
        return span(baseProps([ROSTER_CARD_BODY_CLASS]), [
            image({
                src: GLOBE_ICON_SRC,
                alt: GLOBE_ICON_ALT,
                classes: [ROSTER_CARD_GLOBE_CLASS],
                context: null,
                meta: null,
            }),
            span(textProps([ROSTER_CARD_GLOBAL_LABEL_CLASS], GLOBAL_TITLE_TEXT)),
        ]);
    }
    return rsnTag({
        rsn: member.rsn,
        rank: member.rank,
        size: "sm",
        classes: [ROSTER_CARD_BODY_CLASS],
        context: null,
        meta: null,
    });
}

function toggleMemberScope(scope: ReturnType<typeof signal<Scope>>, hash: string): void {
    const current = scope();
    if (current.kind === "global") {
        scope.set({ kind: "members", set: new Set([hash]) });
        return;
    }
    const next = new Set(current.set);
    if (next.has(hash)) next.delete(hash);
    else next.add(hash);
    scope.set(next.size === 0 ? GLOBAL_SCOPE : { kind: "members", set: next });
}

function bindOverrideMarker(
    card: Instance,
    accountHash: string,
    state: ReturnType<typeof signal<PluginConfigState | null>>,
): void {
    card.trackDispose(
        effect(() => {
            const overrides = state()?.overrides ?? [];
            const hasOverride = overrides.some((o) => o.accountHash === accountHash);
            const markerEl = card.el.querySelector<HTMLElement>(`.${ROSTER_CARD_MARKER_CLASS}`);
            if (markerEl) scheduleText(markerEl, hasOverride ? CUSTOM_MARKER_TEXT : "");
        }),
    );
}

function bindCardActive(
    card: Instance,
    isGlobal: boolean,
    accountHash: string | null,
    scope: ReturnType<typeof signal<Scope>>,
): void {
    card.trackDispose(
        effect(() => {
            const s = scope();
            const active = isGlobal ? s.kind === "global" : s.kind === "members" && s.set.has(accountHash!);
            card.toggleClass(IS_ACTIVE_CLASS, active);
        }),
    );
}

export function buildRosterCard(
    member: PluginConfigMember | null,
    scope: ReturnType<typeof signal<Scope>>,
    state: ReturnType<typeof signal<PluginConfigState | null>>,
): Instance {
    const isGlobal = member === null;
    const accountHash = isGlobal ? null : member.accountHash;
    const card = div(baseProps([ROSTER_CARD_CLASS]), [
        rosterCardBody(member),
        span(textProps([ROSTER_CARD_MARKER_CLASS], "")),
    ]);
    card.setAttr("role", "button");
    card.setAttr("tabindex", "0");
    wireClick(card.el, () => {
        if (isGlobal) scope.set(GLOBAL_SCOPE);
        else toggleMemberScope(scope, accountHash!);
    });
    bindCardActive(card, isGlobal, accountHash, scope);
    if (!isGlobal) bindOverrideMarker(card, accountHash!, state);
    return card;
}
