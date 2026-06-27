import "../../../../styles/pages/clans/home/index.css";
import "../../../../styles/pages/routes/route-clan-page.css";
import "../../../../styles/components/banner/index.css";
import { div, onceEffect, span, type Instance, baseProps, textProps } from "../../../factory";
import { ROUTE_CLAN_CLASS } from "../../../../shared/constants/route/route-constants.js";
import { clanSlug } from "../../../../managers/router";
import { events } from "../../../../managers/events";
import { clansStore } from "../../../../state/clans/stores/clans-store.js";
import { memberClansStore } from "../../../../state/clans/stores/member-clans-store.js";
import { clansClient, type ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { buildClanTabs } from "../clan-page-buttons.js";
import { adaptClanSummary } from "../../../../state/clans/mappers/clan-summary-mapper.js";
import { ensureHomepageStore } from "../../../../state/clans/homepage/homepage-store.js";
import { buildCanvas } from "./canvas.js";
import { buildEditStrip } from "./homepage-edit-strip.js";
import { createEditorState, type EditorState } from "./homepage-editor-state.js";
import { attachKeyboard } from "./homepage-keyboard.js";
import { buildContext } from "../../../../state/clans/homepage/homepage-variables.js";

const MISSING_CLASS = "clans-home__missing";
const HOME_ROOT_CLASS = "clans-home__root";
const STORE_READY_TIMEOUT_MS = 1500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
    return Promise.race([promise, new Promise<void>((res) => setTimeout(res, ms))]);
}

function buildMissing(): Instance {
    return div(
        { classes: [ROUTE_CLAN_CLASS], effects: onceEffect("route-enter-right"), context: null, meta: null },
        [
            div(baseProps([HOME_ROOT_CLASS]), [
                span(textProps([MISSING_CLASS], "Clan not found.")),
            ]),
        ],
    );
}

async function resolveClan(slug: string): Promise<{ clan: ManagedClan; isMember: boolean } | null> {
    await Promise.all([
        withTimeout(clansStore.ready(), STORE_READY_TIMEOUT_MS),
        withTimeout(memberClansStore.ready(), STORE_READY_TIMEOUT_MS),
    ]);
    const managed = clansStore.managed$().find((c) => c.slug === slug);
    const member = memberClansStore.member$().find((c) => c.slug === slug);
    let clan: ManagedClan | undefined = managed ?? member;
    if (clan === undefined) {
        const summary = await clansClient.getClan(slug).catch(() => null);
        if (summary !== null) clan = adaptClanSummary(summary);
    }
    if (clan === undefined) return null;
    return { clan, isMember: managed !== undefined || member !== undefined };
}

export async function renderClanHome(path: string): Promise<Instance> {
    const slug = clanSlug(path);
    if (slug.length === 0) return buildMissing();
    const resolved = await resolveClan(slug);
    if (resolved === null) return buildMissing();
    const { clan, isMember } = resolved;
    const isManager = await clansClient
        .checkManagerStatus(slug)
        .then((s) => s.isManager)
        .catch(() => false);
    const store = ensureHomepageStore(slug);
    const ctx = buildContext(clan);
    const editor: EditorState | null = isManager ? createEditorState(slug, store.components$) : null;
    const innerChildren: Instance[] = [];
    if (editor !== null) {
        innerChildren.push(
            buildEditStrip({
                state: editor,
                onSave: async () => {
                    const ok = await editor.save();
                    if (ok) store.applyOptimistic(editor.draft$());
                    return ok;
                },
            }),
        );
    }
    innerChildren.push(buildCanvas(ctx, store.components$, editor));
    const root = div(
        { classes: [ROUTE_CLAN_CLASS], effects: onceEffect("route-enter-right"), context: null, meta: null },
        [buildClanTabs(clan.slug, isMember, isManager, "home"), div(baseProps([HOME_ROOT_CLASS]), innerChildren)],
    );
    const offKeyboard = editor !== null ? attachKeyboard(editor) : () => undefined;
    const offRoute = events.on("route:change", () => {
        store.dispose();
        editor?.dispose();
        offKeyboard();
        offRoute();
    });
    return root;
}
