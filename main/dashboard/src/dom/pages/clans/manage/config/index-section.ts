import {
    BTN_VARIANT_OUTLINE,
    BTN_VARIANT_PRIMARY,
    button,
    derived,
    div,
    heading,
    paragraph,
    signal,
    type Instance,
    baseProps,
    textProps,
} from "../../../../factory";
import { PLUGIN_CONFIG_FIELDS } from "../../../../../shared/constants/plugin-config/plugin-config-fields.js";
import type { PluginConfigState } from "../../../../../state/clans/plugin-config/client.js";
import { pluginConfigStore } from "../../../../../state/clans/plugin-config/plugin-config-store.js";
import {
    clearLabel,
    effectiveValues,
    metaText,
    publishLabel,
    scopeTitle,
    type Scope,
    type Values,
} from "../../../../../state/clans/plugin-config/index-types.js";
import { buildFieldRow, buildRosterGrid } from "./index-roster.js";
import { dispatchClear, dispatchPublish } from "../../../../../state/clans/plugin-config/index-dispatch.js";

const SECTION_CLASS = "clans-manage__config-section";
const SECTION_TITLE_CLASS = "clans-manage__config-section-title";
const SECTION_META_CLASS = "clans-manage__config-section-meta";
const SCROLL_CLASS = "clans-manage__config-scroll";
const FIELD_LIST_CLASS = "clans-manage__config-field-list";
const ACTIONS_CLASS = "clans-manage__config-actions";
const STATUS_CLASS = "clans-manage__config-status";
const STATUS_SAVING = "Publishing…";
const STATUS_SAVED = "Published.";
const STATUS_FAILED = "Publish failed.";
const STATUS_CLEARED = "Cleared.";

export interface BuildSectionArgs {
    slug: string;
    store: ReturnType<typeof pluginConfigStore>;
    state: ReturnType<typeof signal<PluginConfigState | null>>;
    scope: ReturnType<typeof signal<Scope>>;
    values: ReturnType<typeof signal<Values>>;
    status: ReturnType<typeof signal<string>>;
}

function buildSectionHeader(args: { scope: BuildSectionArgs["scope"]; state: BuildSectionArgs["state"] }): {
    titleEl: Instance;
    metaEl: Instance;
} {
    const { scope, state } = args;
    const titleEl = heading("h2", {
        classes: [SECTION_TITLE_CLASS],
        text: derived(() => scopeTitle(scope(), state()?.members ?? [])),
        context: null,
        meta: null,
    });
    const metaEl = paragraph(
        textProps(
            [SECTION_META_CLASS],
            derived(() => metaText(scope(), state())),
        ),
    );
    return { titleEl, metaEl };
}

function buildPublishBtn(args: BuildSectionArgs): Instance {
    const { slug, store, state, scope, values, status } = args;
    return button({
        variant: BTN_VARIANT_PRIMARY,
        
        text: derived(() => publishLabel(scope())),
        context: "publish the plugin config to the active scope",
        meta: ["action", "plugin-config"],
        onClick: async () => {
            status.set(STATUS_SAVING);
            const ok = await dispatchPublish(slug, scope(), values());
            status.set(ok ? STATUS_SAVED : STATUS_FAILED);
            if (ok) {
                await store.refresh();
                const next = store.config$();
                if (next !== null) state.set(next);
            }
        },
    });
}

function buildClearBtn(args: BuildSectionArgs): Instance {
    const { slug, store, state, scope, values, status } = args;
    return button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: derived(() => clearLabel(scope())),
        context: "clear the plugin config for the active scope",
        meta: ["action", "plugin-config"],
        onClick: async () => {
            status.set(STATUS_SAVING);
            const ok = await dispatchClear(slug, scope());
            status.set(ok ? STATUS_CLEARED : STATUS_FAILED);
            if (ok) {
                await store.refresh();
                const next = store.config$();
                if (next !== null) {
                    state.set(next);
                    values.set(effectiveValues(scope(), next));
                }
            }
        },
    });
}

export function buildSection(args: BuildSectionArgs): Instance {
    const { scope, state, values, status } = args;
    const { titleEl, metaEl } = buildSectionHeader({ scope, state });
    const fieldList = div(
        { classes: [FIELD_LIST_CLASS], context: null, meta: null },
        PLUGIN_CONFIG_FIELDS.map((f) => buildFieldRow(f, values)),
    );
    const scroll = div(baseProps([SCROLL_CLASS]), [fieldList, buildRosterGrid(scope, state)]);
    const publishBtn = buildPublishBtn(args);
    const clearBtn = buildClearBtn(args);
    const statusEl = paragraph(
        textProps(
            [STATUS_CLASS],
            derived(() => status()),
        ),
    );
    return div(baseProps([SECTION_CLASS]), [
        titleEl,
        metaEl,
        scroll,
        div(baseProps([ACTIONS_CLASS]), [publishBtn, clearBtn, statusEl]),
    ]);
}
