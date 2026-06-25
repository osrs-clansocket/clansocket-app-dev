import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, effect, paragraph, type Instance } from "../../../../../../factory";
import { settingsFeed } from "../../../../../../../state/discord/guild-settings/guild-settings-feed.js";
import { guildDataVersion, listChannels } from "../../../../../../../state/discord/guild-state-cache.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import type { DiscordGuildSettings } from "../../../../../../../state/discord/client.js";
import {
    accessFields,
    identityFields,
    structureFields,
} from "../../../../../../../state/discord/guild-settings/mode-fields.js";
import { DISCORD_PANE_PLACEHOLDER_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { defineDiscordMode } from "../../registry";

const LOADING_TEXT = "Loading guild settings…";

function buildSettingsForm(s: DiscordGuildSettings): Instance {
    const sess = identityStore.session$();
    const uid = sess?.id ?? "";
    return div({ classes: [], context: null, meta: null }, [
        ...identityFields(s, uid),
        ...structureFields(s, uid),
        ...accessFields(s, uid),
    ]);
}

function subscribeFirstSettings(guildId: string, onFirst: (s: DiscordGuildSettings) => void): () => void {
    const feed = settingsFeed(guildId);
    return feed.source.subscribe(
        (snap) => {
            const first = (snap.rows as DiscordGuildSettings[])[0];
            if (first) onFirst(first);
        },
        () => undefined,
    );
}

interface SettingsState {
    rendered: boolean;
    firstSettings: DiscordGuildSettings | null;
}

function attemptRenderSettings(state: SettingsState, guildId: string, pane: Instance): void {
    if (state.rendered || state.firstSettings === null || listChannels(guildId).length === 0) return;
    state.rendered = true;
    pane.setChildren(buildSettingsForm(state.firstSettings));
}

defineDiscordMode({
    key: "server-settings",
    label: "Server Settings",
    order: 70,
    build: (ctx) => settingsMode(ctx.server.guild_id),
});

export function settingsMode(guildId: string): Instance {
    const pane = div({ classes: [], context: null, meta: null }, [
        paragraph({ classes: [DISCORD_PANE_PLACEHOLDER_CLASS], text: LOADING_TEXT, context: null, meta: null }),
    ]);
    const state: SettingsState = { rendered: false, firstSettings: null };
    const tryRender = (): void => attemptRenderSettings(state, guildId, pane);
    const unsubscribe = subscribeFirstSettings(guildId, (s) => {
        state.firstSettings = s;
        tryRender();
    });
    const watcher = effect(() => {
        guildDataVersion();
        tryRender();
    });
    pane.trackDispose({
        dispose: () => {
            unsubscribe();
            watcher.dispose();
        },
    });
    return pane;
}
