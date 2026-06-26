import { div, effect, paragraph, signal, type Instance, baseProps, textProps } from "../../../../../../../factory";
import { AUTO_HOOKS_PREVIEW_ROOT_CLASS } from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { CLAN_MANAGE_AUTO_HOOKS_PREVIEW_PANE_LABEL_CLASS } from "../../../../../../../../shared/constants/clan/manage-constants.js";
import { ensureLoaded } from "../../../../../../../../state/icons/discord-emojis-store.js";
import { previewState$ } from "./preview-state.js";
import { renderContentPreview } from "./render-content-preview.js";
import { renderEmbedPreview } from "./render-embed-preview.js";

const EMPTY_HINT = "Focus a card's format editor to see a live preview here.";

function emptyHintEl(): Instance {
    return paragraph(textProps([CLAN_MANAGE_AUTO_HOOKS_PREVIEW_PANE_LABEL_CLASS], EMPTY_HINT));
}

interface PreviewSlots {
    empty: Instance;
    contentHost: Instance;
    embedHost: Instance;
}

function applyPreviewSlots(slots: PreviewSlots, state: ReturnType<typeof previewState$>): void {
    if (state === null) {
        slots.empty.el.hidden = false;
        slots.contentHost.el.hidden = true;
        slots.embedHost.el.hidden = true;
        return;
    }
    slots.empty.el.hidden = true;
    slots.contentHost.el.hidden = false;
    slots.contentHost.setChildren(renderContentPreview(state));
    if (state.useEmbed) {
        slots.embedHost.el.hidden = false;
        slots.embedHost.setChildren(renderEmbedPreview(state));
    } else {
        slots.embedHost.el.hidden = true;
    }
}

export function buildPreviewPane(): Instance {
    const empty = emptyHintEl();
    const contentHost = div({ context: null, meta: null });
    const embedHost = div({ context: null, meta: null });
    contentHost.el.hidden = true;
    embedHost.el.hidden = true;
    const root = div(baseProps([AUTO_HOOKS_PREVIEW_ROOT_CLASS]), [empty, contentHost, embedHost]);
    const slots: PreviewSlots = { empty, contentHost, embedHost };
    const emojisLoaded$ = signal<boolean>(false);
    void ensureLoaded().then(() => emojisLoaded$.set(true));
    root.trackDispose(
        effect(() => {
            emojisLoaded$();
            applyPreviewSlots(slots, previewState$());
        }),
    );
    return root;
}
