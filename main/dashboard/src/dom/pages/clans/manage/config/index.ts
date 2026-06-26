import "../../../../../styles/pages/clans/manage/clan-config-page.css";
import { div, effect, paragraph, signal, type Disposable, baseProps, textProps } from "../../../../factory";
import type { PluginConfigState } from "../../../../../state/clans/plugin-config/client.js";
import { pluginConfigStore } from "../../../../../state/clans/plugin-config/plugin-config-store.js";
import {
    effectiveValues,
    GLOBAL_SCOPE,
    scopeEquals,
    seedValues,
    type Scope,
    type Values,
} from "../../../../../state/clans/plugin-config/index-types.js";
import { buildSection } from "./index-section.js";

const ROOT_CLASS = "clans-manage__config";
const LOADING_CLASS = "clans-manage__config-loading";
const LOADING_TEXT = "Loading config…";

function bindScopeEffect(
    scope: ReturnType<typeof signal<Scope>>,
    state: ReturnType<typeof signal<PluginConfigState | null>>,
    values: ReturnType<typeof signal<Values>>,
): Disposable {
    let lastScope: Scope = GLOBAL_SCOPE;
    return effect(() => {
        const s = scope();
        const cfg = state();
        if (!cfg) return;
        if (!scopeEquals(s, lastScope)) {
            values.set(effectiveValues(s, cfg));
            lastScope = s;
        }
    });
}

export function build(slug: string): HTMLElement {
    const host = div(baseProps([ROOT_CLASS]), [paragraph(textProps([LOADING_CLASS], LOADING_TEXT))]);
    const store = pluginConfigStore(slug);
    const state = signal<PluginConfigState | null>(null);
    const scope = signal<Scope>(GLOBAL_SCOPE);
    const values = signal<Values>(seedValues());
    const status = signal<string>("");
    host.trackDispose(bindScopeEffect(scope, state, values));
    void store.refresh().then(() => {
        const next = store.config$();
        if (next === null) return;
        state.set(next);
        values.set(effectiveValues(GLOBAL_SCOPE, next));
        host.setChildren(buildSection({ slug, store, state, scope, values, status }));
    });
    return host.el;
}
