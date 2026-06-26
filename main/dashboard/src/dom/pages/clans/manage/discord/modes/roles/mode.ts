import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import {
    button,
    div,
    paragraph,
    treeView,
    BTN_VARIANT_BARE,
    type Instance,
    baseProps,
} from "../../../../../../factory";
import { createRolesFeed } from "../../../../../../../state/discord/roles/roles-feed.js";
import { createDiscordRole, type DiscordRole } from "../../../../../../../state/discord/client.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import { buildRoleNodes } from "./mode-nodes.js";
import type { ModeContext } from "../../registry";

const EMPTY_TEXT = "No roles in this guild yet.";
const EMPTY_CLASS = "clans-manage__discord-roles-empty";
const TOOLBAR_CLASS = "clans-manage__discord-channels-toolbar";
const TOOLBAR_BTN_CLASS = "clans-manage__discord-toolbar-btn";
const MODE_HOST_CLASS = "clans-manage__discord-mode";
const CREATE_BTN_TEXT = "+ Create role";
const NEW_ROLE_NAME = "new role";

async function createRole(guildId: string): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    await createDiscordRole(guildId, {
        userId: session.id,
        name: NEW_ROLE_NAME,
    });
}

function buildToolbar(guildId: string): Instance {
    void identityStore.refresh();
    const createBtn = button({
        classes: [TOOLBAR_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: CREATE_BTN_TEXT,
        context: "create a new role with default values",
        meta: ["action"],
        onClick: () => void createRole(guildId),
    });
    return div(baseProps([TOOLBAR_CLASS]), [createBtn]);
}

function applyRoleDeltas(
    latest: readonly DiscordRole[],
    deltas: { op: string; key: string; row?: unknown }[],
): DiscordRole[] {
    const byKey = new Map(latest.map((r) => [r.role_id, r]));
    for (const d of deltas) {
        if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordRole);
        else if (d.op === "remove") byKey.delete(d.key);
    }
    return [...byKey.values()];
}

function subscribeRolesFeed(
    guildId: string,
    getLatest: () => readonly DiscordRole[],
    setLatest: (next: readonly DiscordRole[]) => void,
    rerender: () => void,
): () => void {
    const feed = createRolesFeed(guildId);
    return feed.source.subscribe(
        (snap) => {
            setLatest(snap.rows as DiscordRole[]);
            rerender();
        },
        (batch) => {
            setLatest(applyRoleDeltas(getLatest(), batch.deltas));
            rerender();
        },
    );
}

function makeRolesRerender(
    treeHost: Instance,
    empty: Instance,
    guildId: string,
    getLatest: () => readonly DiscordRole[],
): () => void {
    return (): void => {
        const latest = getLatest();
        if (latest.length === 0) {
            treeHost.clear();
            empty.el.hidden = false;
            return;
        }
        empty.el.hidden = true;
        treeHost.setChildren(treeView(buildRoleNodes(latest, guildId, treeHost)));
    };
}

export function buildRolesMode(guildId: string): Instance {
    const treeHost = div(baseProps([]));
    const empty = paragraph({ classes: [EMPTY_CLASS], text: EMPTY_TEXT, hidden: "", context: null, meta: null });
    let latest: readonly DiscordRole[] = [];
    const rerender = makeRolesRerender(treeHost, empty, guildId, () => latest);
    const unsubscribe = subscribeRolesFeed(
        guildId,
        () => latest,
        (next) => {
            latest = next;
        },
        rerender,
    );
    const modeHost = div(baseProps([MODE_HOST_CLASS]), [buildToolbar(guildId), treeHost, empty]);
    modeHost.trackDispose({ dispose: () => unsubscribe() });
    return modeHost;
}

export const build = (ctx: ModeContext): Instance => buildRolesMode(ctx.server.guild_id);
