import {
    BTN_VARIANT_BARE,
    button,
    derived,
    div,
    effect,
    icon,
    signal,
    span,
    type Instance,
} from "../../../../../../factory";
import { reconcile } from "../../../../../../factory/live-ops/reconcile.js";
import {
    guildDataVersion,
    listChannels,
    listMembers,
    listRoles,
} from "../../../../../../../state/discord/guild-state-cache.js";
import {
    ACCORDION_BODY_CLASS,
    ACCORDION_CHEVRON_CLASS,
    ACCORDION_CLASS,
    ACCORDION_HEADER_CLASS,
    ACCORDION_LABEL_CLASS,
    ACCORDION_OPEN_CLASS,
    CHEVRON_ICON_NAME,
} from "./mode-constants.js";
import { buildSwatch } from "../../../../../../../state/discord/permissions/mode-drag.js";

function swatchHeader(title: string, getLabel: () => string, accordion: Instance): Instance {
    let isOpen = false;
    return button(
        {
            classes: [ACCORDION_HEADER_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: `Toggle ${title} swatches`,
            context: `toggle ${title} accordion`,
            meta: ["action"],
            onClick: () => {
                isOpen = !isOpen;
                accordion.toggleClass(ACCORDION_OPEN_CLASS, isOpen);
            },
        },
        [
            icon({ name: CHEVRON_ICON_NAME, classes: [ACCORDION_CHEVRON_CLASS], context: null, meta: null }),
            span({ classes: [ACCORDION_LABEL_CLASS], text: derived(getLabel), context: null, meta: null }),
        ],
    );
}

function buildSwatchShell(getLabel: () => string, body: Instance, title: string): Instance {
    const accordion = div({ classes: [ACCORDION_CLASS], context: null, meta: null });
    accordion.setChildren(swatchHeader(title, getLabel, accordion), body);
    return accordion;
}

interface SwatchPanelState {
    channelsBody: Instance;
    rolesBody: Instance;
    membersBody: Instance;
    channelsLabel: ReturnType<typeof signal<string>>;
    rolesLabel: ReturnType<typeof signal<string>>;
    membersLabel: ReturnType<typeof signal<string>>;
    channelState: Map<string, Instance>;
    roleState: Map<string, Instance>;
    memberState: Map<string, Instance>;
}

function freshSwatchState(): SwatchPanelState {
    return {
        channelsBody: div({ classes: [ACCORDION_BODY_CLASS], context: null, meta: null }),
        rolesBody: div({ classes: [ACCORDION_BODY_CLASS], context: null, meta: null }),
        membersBody: div({ classes: [ACCORDION_BODY_CLASS], context: null, meta: null }),
        channelsLabel: signal<string>("Channels (0)"),
        rolesLabel: signal<string>("Roles (0)"),
        membersLabel: signal<string>("Members (0)"),
        channelState: new Map<string, Instance>(),
        roleState: new Map<string, Instance>(),
        memberState: new Map<string, Instance>(),
    };
}

function reconcileChannelsSwatch(s: SwatchPanelState, cs: ReturnType<typeof listChannels>): void {
    reconcile({
        container: s.channelsBody,
        state: s.channelState,
        items: cs,
        keyOf: (c) => c.channel_id,
        create: (c) => buildSwatch("channel", c.channel_id, c.name ?? c.channel_id),
    });
}

function reconcileSwatchEntities(
    s: SwatchPanelState,
    cs: ReturnType<typeof listChannels>,
    rs: ReturnType<typeof listRoles>,
    ms: ReturnType<typeof listMembers>,
): void {
    reconcileChannelsSwatch(s, cs);
    reconcile({
        container: s.rolesBody,
        state: s.roleState,
        items: rs,
        keyOf: (r) => r.role_id,
        create: (r) => buildSwatch("role", r.role_id, r.name),
    });
    reconcile({
        container: s.membersBody,
        state: s.memberState,
        items: ms,
        keyOf: (m) => m.user_id,
        create: (m) => buildSwatch("member", m.user_id, m.display_name ?? m.name),
    });
}

function reconcileSwatchPanel(args: { guildId: string; s: SwatchPanelState }): void {
    const { guildId, s } = args;
    const cs = listChannels(guildId);
    const rs = listRoles(guildId);
    const ms = listMembers(guildId);
    reconcileSwatchEntities(s, cs, rs, ms);
    s.channelsLabel.set(`Channels (${cs.length})`);
    s.rolesLabel.set(`Roles (${rs.length})`);
    s.membersLabel.set(`Members (${ms.length})`);
}

export function buildSwatchPanel(guildId: string): Instance[] {
    const s = freshSwatchState();
    const channelsAccordion = buildSwatchShell(() => s.channelsLabel(), s.channelsBody, "Channels");
    const rolesAccordion = buildSwatchShell(() => s.rolesLabel(), s.rolesBody, "Roles");
    const membersAccordion = buildSwatchShell(() => s.membersLabel(), s.membersBody, "Members");
    s.channelsBody.trackDispose(
        effect(() => {
            guildDataVersion();
            reconcileSwatchPanel({ guildId, s });
        }),
    );
    return [channelsAccordion, rolesAccordion, membersAccordion];
}
