import "../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, effect, paragraph, signal, type Instance, baseProps, textProps } from "../../../../factory";
import { serversStoreFor } from "../../../../../state/discord/servers-store.js";
import { clearSelected } from "../../../../../state/discord/selected-item.js";
import { inspectorOverride$ } from "../../../../../state/discord/inspector-override.js";
import { clearPreviewState } from "./modes/auto-hooks/preview/preview-state.js";
import type { DiscordServer } from "../../../../../state/discord/client.js";
import {
    DISCORD_FRAME_CLASS,
    DISCORD_LOADING_CLASS,
    DISCORD_ROOT_CLASS,
} from "../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildEmptyInstall } from "./frame/empty-install.js";
import { buildFooter } from "./frame/footer.js";
import { buildHeader } from "./frame/header.js";
import { buildPaneCenter } from "./frame/pane-center.js";
import { buildRailLeft } from "./frame/rail-left.js";
import { buildRailRight } from "./frame/rail-right.js";
import { modeContent } from "./mode-registry.js";

const LOADING_TEXT = "Loading discord…";
const DEFAULT_MODE_KEY = "channels";

function buildLoading(): Instance {
    return paragraph(textProps([DISCORD_LOADING_CLASS], LOADING_TEXT));
}

function resolveServer(servers: readonly DiscordServer[], guildId: string): DiscordServer {
    return servers.find((s) => s.guild_id === guildId) ?? servers[0]!;
}

function makeSelectHandler(
    selectedGuildId: ReturnType<typeof signal<string>>,
    renderModeFor: (g: string) => void,
): (g: string) => void {
    return (guildId: string) => {
        if (guildId === selectedGuildId()) return;
        selectedGuildId.set(guildId);
        clearSelected();
        renderModeFor(guildId);
    };
}

function buildFrame(slug: string, servers: readonly DiscordServer[], subTab: string): Instance {
    const initialServer = servers[0]!;
    const selectedGuildId = signal<string>(initialServer.guild_id);
    const paneCenter = buildPaneCenter();
    const renderModeFor = (guildId: string): void => {
        paneCenter.setMode(modeContent({ slug, servers, server: resolveServer(servers, guildId) }, subTab));
    };
    const header = buildHeader({
        slug,
        servers,
        activeGuildId: () => selectedGuildId(),
        onSelect: makeSelectHandler(selectedGuildId, renderModeFor),
    });
    paneCenter.setMode(modeContent({ slug, servers, server: initialServer }, subTab));
    return div(baseProps([DISCORD_FRAME_CLASS]), [
        header,
        buildRailLeft({ slug, activeKey: subTab }),
        paneCenter.pane,
        buildRailRight(),
        buildFooter(),
    ]);
}

function renderForState(slug: string, host: Instance, servers: readonly DiscordServer[] | null, subTab: string): void {
    if (servers === null) {
        host.setChildren(buildLoading());
        return;
    }
    if (servers.length === 0) {
        host.setChildren(buildEmptyInstall(slug));
        return;
    }
    host.setChildren(buildFrame(slug, servers, subTab));
}

export function build(slug: string, subTab?: string | null): HTMLElement {
    inspectorOverride$.set(null);
    clearPreviewState();
    const host = div(baseProps([DISCORD_ROOT_CLASS]), [buildLoading()]);
    const store = serversStoreFor(slug);
    void store.ensure();
    const mode = subTab ?? DEFAULT_MODE_KEY;
    host.trackDispose(
        effect(() => {
            renderForState(slug, host, store.servers(), mode);
        }),
    );
    return host.el;
}
