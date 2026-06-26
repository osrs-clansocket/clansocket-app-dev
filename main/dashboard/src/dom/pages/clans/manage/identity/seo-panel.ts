import "../../../../../styles/pages/clans/manage/identity/clan-seo-page.css";
import {
    BTN_VARIANT_PRIMARY,
    button,
    div,
    effect,
    heading,
    paragraph,
    type Instance,
    baseProps,
    textProps,
} from "../../../../factory";
import { clansClient } from "../../../../../state/clans/clans-client/index.js";
import { clanSeoStore, refreshActive, setActiveSlug } from "../../../../../state/clans/discovery/clan-seo-store.js";
import {
    ACCOUNT_CLAN_BRANDING_SECTION_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_INSTRUCTIONS_CLASS,
    ACCOUNT_PANEL_TITLE_CLASS,
} from "../../../../../shared/constants/account-constants.js";
import { diffPatch } from "../../../../../state/clans/discovery/seo-form.js";
import {
    commitLoaded,
    isDirty,
    newPanelState,
    STATUS_EMPTY,
    STATUS_FAILED,
    STATUS_SAVED,
    type PanelState,
} from "./seo-state.js";
import type { Disposable } from "../../../../factory/reactive/index.js";
import { buildDescriptionInput, buildField, buildTextInput, buildToggleRow } from "./seo-fields.js";

const SECTION_TITLE = "Discoverability";
const SECTION_INSTRUCTIONS =
    "Set the clan's title, description, and image for search results and social-share previews.";

function bindStore(state: PanelState): Disposable {
    let initialCommitted = false;
    return effect(() => {
        const seo = clanSeoStore.seo$();
        if (seo === null) return;
        if (initialCommitted) return;
        initialCommitted = true;
        commitLoaded(state, seo);
    });
}

async function saveChanges(slug: string, state: PanelState): Promise<void> {
    const patch = diffPatch(state.form(), state.original());
    if (Object.keys(patch).length === 0) return;
    state.saving.set(true);
    state.status.set(STATUS_EMPTY);
    const updated = await clansClient.updateClanSeo(slug, patch);
    state.saving.set(false);
    if (updated === null) {
        state.status.set(STATUS_FAILED);
        return;
    }
    commitLoaded(state, updated);
    state.status.set(STATUS_SAVED);
    void refreshActive();
}

function buildSaveButton(slug: string, state: PanelState): Instance {
    const btn = button({
        variant: BTN_VARIANT_PRIMARY,
        
        text: "Save",
        context: "save clan discoverability changes",
        meta: ["submit"],
        onClick: () => {
            void saveChanges(slug, state);
        },
    });
    btn.trackDispose(
        effect(() => {
            btn.el.disabled = !isDirty(state) || state.saving();
        }),
    );
    return btn;
}

function buildStatus(state: PanelState): Instance {
    return paragraph(textProps([ACCOUNT_EMPTY_CLASS], state.status));
}

export function buildSeoPanel(slug: string): Instance {
    const state = newPanelState();
    setActiveSlug(slug);
    clanSeoStore.ensure();
    const host = div(baseProps([ACCOUNT_CLAN_BRANDING_SECTION_CLASS]), [
        heading("h3", { classes: [ACCOUNT_PANEL_TITLE_CLASS], text: SECTION_TITLE, context: null, meta: null }),
        paragraph(textProps([ACCOUNT_INSTRUCTIONS_CLASS], SECTION_INSTRUCTIONS)),
        buildToggleRow(state),
        buildField("Title", buildTextInput(state, "title", "Defaults to the clan name", "Title")),
        buildField("Description", buildDescriptionInput(state)),
        buildField("Image URL", buildTextInput(state, "image", "https://… (defaults to clan banner)", "Image URL")),
        buildSaveButton(slug, state),
        buildStatus(state),
    ]);
    host.trackDispose(bindStore(state));
    return host;
}
