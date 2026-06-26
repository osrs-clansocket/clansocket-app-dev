import { div, heading, onceEffect, paragraph, span, type Instance, baseProps, textProps } from "../../factory";
import type { ManagedClan, ClanRosterMember } from "../../../state/clans/clans-client/index.js";
import type { ClanRankLadder } from "../../../state/icons/rank-sort.js";
import { persistSort, persistView, type RosterSort, type RosterView } from "../../../state/clans/roster/prefs.js";
import { buildRosterGrid, buildRosterList } from "./roster-items.js";
import { applySort, buildSortToggle, buildViewToggle } from "./toggles.js";
import { buildManageBtn, buildMapBtn } from "./clan-page-buttons.js";
import {
    CLAN_HEADING_CLASS,
    CLAN_NAME_CLASS,
    CLAN_ROSTER_CONTROLS_CLASS,
    CLAN_ROSTER_COUNT_CLASS,
    CLAN_ROSTER_EMPTY_CLASS,
    CLAN_ROSTER_TITLE_GROUP_CLASS,
    CLAN_ROSTER_TOOLBAR_CLASS,
    CLAN_SECTION_TITLE_CLASS,
    CLAN_STATUS_CLASS,
} from "../../../shared/constants/clan/clan-page-constants.js";
import { ROUTE_CLAN_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";

export interface LoadedState {
    clan: ManagedClan;
    members: ClanRosterMember[];
    viewRef: { v: RosterView };
    sortRef: { v: RosterSort };
    host: Instance;
    ladder: ClanRankLadder;
}

function makeRenderRoster(s: LoadedState): () => void {
    return (): void => {
        if (s.members.length === 0) {
            s.host.setChildren(paragraph(textProps([CLAN_ROSTER_EMPTY_CLASS], "Awaiting roster..")));
            return;
        }
        const sorted = applySort(s.members, s.sortRef.v, s.ladder);
        s.host.setChildren(s.viewRef.v === "grid" ? buildRosterGrid(sorted) : buildRosterList(sorted));
    };
}

function buildRosterControls(args: {
    clan: ManagedClan;
    isManager: boolean;
    viewRef: { v: RosterView };
    sortRef: { v: RosterSort };
    render: () => void;
}): Instance {
    const { clan, isManager, viewRef, sortRef, render } = args;
    const onViewChange = (v: RosterView): void => {
        viewRef.v = v;
        persistView(v);
        render();
    };
    const onSortChange = (v: RosterSort): void => {
        sortRef.v = v;
        persistSort(v);
        render();
    };
    const children: Instance[] = [buildMapBtn(clan.slug)];
    if (isManager) children.push(buildManageBtn(clan.slug));
    children.push(buildSortToggle(sortRef.v, onSortChange));
    children.push(buildViewToggle(viewRef.v, onViewChange));
    return div(baseProps([CLAN_ROSTER_CONTROLS_CLASS]), children);
}

function buildClanToolbar(args: { memberCount: number; controls: Instance }): Instance {
    const { memberCount, controls } = args;
    return div(baseProps([CLAN_ROSTER_TOOLBAR_CLASS]), [
        div(baseProps([CLAN_ROSTER_TITLE_GROUP_CLASS]), [
            heading("h2", { classes: [CLAN_SECTION_TITLE_CLASS], text: "Roster", context: null, meta: null }),
            span(textProps([CLAN_ROSTER_COUNT_CLASS], String(memberCount))),
        ]),
        controls,
    ]);
}

function buildClanHeader(clan: ManagedClan): Instance[] {
    return [
        heading("h1", {
            classes: [CLAN_HEADING_CLASS, CLAN_NAME_CLASS],
            text: clan.displayName,
            context: null,
            meta: null,
        }),
        span(textProps([CLAN_STATUS_CLASS], clan.status)),
    ];
}

function initLoadedState(
    clan: ManagedClan,
    ladder: ClanRankLadder,
    prefs: { view: RosterView; sort: RosterSort },
): LoadedState {
    return {
        clan,
        ladder,
        members: clan.roster?.members ?? [],
        viewRef: { v: prefs.view },
        sortRef: { v: prefs.sort },
        host: div({ context: null, meta: null }),
    };
}

function setupLoadedState(
    clan: ManagedClan,
    isManager: boolean,
    ladder: ClanRankLadder,
    prefs: { view: RosterView; sort: RosterSort },
): { state: LoadedState; controls: Instance } {
    const state = initLoadedState(clan, ladder, prefs);
    const renderRoster = makeRenderRoster(state);
    renderRoster();
    const controls = buildRosterControls({
        clan,
        isManager,
        viewRef: state.viewRef,
        sortRef: state.sortRef,
        render: renderRoster,
    });
    return { state, controls };
}

export function buildLoaded(
    clan: ManagedClan,
    isManager: boolean,
    ladder: ClanRankLadder,
    prefs: { view: RosterView; sort: RosterSort },
): Instance {
    const { state, controls } = setupLoadedState(clan, isManager, ladder, prefs);
    return div(
        {
            classes: [ROUTE_ROOT_CLASS, ROUTE_CLAN_CLASS],
            effects: onceEffect("route-enter-right"),
            context: null,
            meta: null,
        },
        [...buildClanHeader(clan), buildClanToolbar({ memberCount: state.members.length, controls }), state.host],
    );
}
