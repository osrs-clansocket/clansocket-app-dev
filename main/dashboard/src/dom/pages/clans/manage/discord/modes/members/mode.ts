import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { paragraph, buildTreeNode, TREE_CLASS, div, type Instance } from "../../../../../../factory";
import { reconcile } from "../../../../../../factory/live-ops/reconcile.js";
import { createMembersFeed } from "../../../../../../../state/discord/members/members-feed.js";
import type { DiscordMember } from "../../../../../../../state/discord/client.js";
import { memberLeafFor, sortedByLabel } from "./mode-nodes.js";
import { DISCORD_PANE_PLACEHOLDER_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { defineDiscordMode } from "../../registry";

const EMPTY_TEXT = "No members in this guild yet.";
const MODE_HOST_CLASS = "clans-manage__discord-mode";

function applyMemberDeltas(
    latest: readonly DiscordMember[],
    deltas: { op: string; key: string; row?: unknown }[],
): DiscordMember[] {
    const byKey = new Map(latest.map((m) => [m.user_id, m]));
    for (const d of deltas) {
        if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordMember);
        else if (d.op === "remove") byKey.delete(d.key);
    }
    return [...byKey.values()];
}

function subscribeMembersFeed(
    guildId: string,
    getLatest: () => readonly DiscordMember[],
    setLatest: (next: readonly DiscordMember[]) => void,
    rerender: () => void,
): () => void {
    const feed = createMembersFeed(guildId);
    return feed.source.subscribe(
        (snap) => {
            setLatest(snap.rows as DiscordMember[]);
            rerender();
        },
        (batch) => {
            setLatest(applyMemberDeltas(getLatest(), batch.deltas));
            rerender();
        },
    );
}

function clearMembersTree(treeHost: Instance, empty: Instance, leafState: Map<string, Instance>): void {
    for (const inst of leafState.values()) inst.destroy();
    leafState.clear();
    treeHost.el.hidden = true;
    empty.el.hidden = false;
}

interface MembersRerenderArgs {
    treeHost: Instance;
    empty: Instance;
    guildId: string;
    leafState: Map<string, Instance>;
    getLatest: () => readonly DiscordMember[];
}

function makeMembersRerender(args: MembersRerenderArgs): () => void {
    const { treeHost, empty, guildId, leafState, getLatest } = args;
    return (): void => {
        const latest = getLatest();
        if (latest.length === 0) {
            clearMembersTree(treeHost, empty, leafState);
            return;
        }
        treeHost.el.hidden = false;
        empty.el.hidden = true;
        reconcile<DiscordMember>({
            container: treeHost,
            state: leafState,
            items: sortedByLabel(latest),
            keyOf: (m) => m.user_id,
            create: (m) => buildTreeNode(memberLeafFor(m, guildId, treeHost)),
        });
    };
}

defineDiscordMode({
    key: "members",
    label: "Members",
    order: 40,
    build: (ctx) => buildMembersMode(ctx.server.guild_id),
});

function makeEmptyEl(): Instance {
    return paragraph({
        classes: [DISCORD_PANE_PLACEHOLDER_CLASS],
        text: EMPTY_TEXT,
        hidden: "",
        context: null,
        meta: null,
    });
}

export function buildMembersMode(guildId: string): Instance {
    const treeHost = div({ classes: [TREE_CLASS], context: null, meta: null });
    const empty = makeEmptyEl();
    treeHost.el.hidden = true;
    const leafState = new Map<string, Instance>();
    let latest: readonly DiscordMember[] = [];
    const rerender = makeMembersRerender({ treeHost, empty, guildId, leafState, getLatest: () => latest });
    const unsubscribe = subscribeMembersFeed(
        guildId,
        () => latest,
        (next) => {
            latest = next;
        },
        rerender,
    );
    const modeHost = div({ classes: [MODE_HOST_CLASS], context: null, meta: null }, [treeHost, empty]);
    modeHost.trackDispose({
        dispose: () => {
            for (const inst of leafState.values()) inst.destroy();
            leafState.clear();
            unsubscribe();
        },
    });
    return modeHost;
}
