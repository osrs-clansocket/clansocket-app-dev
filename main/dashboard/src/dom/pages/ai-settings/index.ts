import "../../../styles/pages/ai-settings/index.css";
import { div, onceEffect, type Instance } from "../../factory";
import { ROUTE_AI_SETTINGS_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";
import { aiSettingsTab } from "../../../managers/router";
import { buildHeader } from "./header.js";
import { buildContent } from "./content.js";
import { buildDiag } from "./diag.js";
import { activeTab$, resolveAiSettingsTab } from "./state.js";

const PAGE_BLOCK_CLASS = "ai-settings";

export function renderAiSettings(path: string): Instance {
    activeTab$.set(resolveAiSettingsTab(aiSettingsTab(path)));
    return div(
        {
            classes: [ROUTE_ROOT_CLASS, ROUTE_AI_SETTINGS_CLASS, PAGE_BLOCK_CLASS],
            effects: onceEffect("route-enter-right"),
            context: null,
            meta: null,
        },
        [buildHeader(), buildContent(), buildDiag()],
    );
}
