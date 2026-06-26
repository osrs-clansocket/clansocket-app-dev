import { div, effect, heading, icon, paragraph, section, type Instance, baseProps, textProps } from "../../factory";
import { mount as mountMemory } from "./memory/tab.js";
import { mount as mountModes } from "./modes/tab.js";
import { mount as mountOperation } from "./operation/tab.js";
import { mount as mountPersona } from "./persona/tab.js";
import { mount as mountPreferences } from "./preferences/tab.js";
import { renderUserProfile } from "./user-profile.js";
import { activeTab$, CONCERN_BY_KEY, TABS, type ConcernDef, type ConcernKey, type TabKey } from "./state.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../../../shared/constants/hidden-attr-constants.js";

const CONTENT_CLASS = "ai-settings__content";
const TAB_PANEL_CLASS = "ai-settings__tab-panel";
const SECTION_CLASS = "ai-settings__section";
const SECTION_HEAD_CLASS = "ai-settings__section-head";
const SECTION_ICON_CLASS = "ai-settings__section-icon";
const SECTION_TITLE_CLASS = "ai-settings__section-title";
const SECTION_TAGLINE_CLASS = "ai-settings__section-tagline";
const SECTION_BODY_CLASS = "ai-settings__section-body";

const MOUNTERS: Record<ConcernKey, (host: Instance) => void> = {
    memory: mountMemory,
    profile: renderUserProfile,
    modes: mountModes,
    persona: mountPersona,
    operation: mountOperation,
    preferences: mountPreferences,
};

function sectionVariantClass(key: ConcernKey): string {
    return `ai-settings__section--${key}`;
}

function buildSectionHead(label: string, iconName: string, tagline: string): Instance {
    const iconEl = icon({ name: iconName, classes: [SECTION_ICON_CLASS], context: null, meta: null });
    const titleEl = heading("h2", { classes: [SECTION_TITLE_CLASS], text: label, context: null, meta: null });
    const taglineEl = paragraph(textProps([SECTION_TAGLINE_CLASS], tagline));
    return div(baseProps([SECTION_HEAD_CLASS]), [iconEl, div({ context: null, meta: null }, [titleEl, taglineEl])]);
}

function buildConcernSection(def: ConcernDef): Instance {
    const body = div(baseProps([SECTION_BODY_CLASS]));
    MOUNTERS[def.key](body);
    const sec = section(
        {
            classes: [SECTION_CLASS, sectionVariantClass(def.key)],
            data: { concern: def.key },
            context: null,
            meta: null,
        },
        [buildSectionHead(def.label, def.icon, def.tagline), body],
    );
    sec.el.id = `ai-settings-section-${def.key}`;
    return sec;
}

function buildTabPanel(tabKey: TabKey, concerns: ConcernKey[]): Instance {
    const sections = concerns.map((k) => buildConcernSection(CONCERN_BY_KEY.get(k)!));
    const panel = div(
        {
            classes: [TAB_PANEL_CLASS],
            data: { "tab-key": tabKey },
            role: "tabpanel",
            context: null,
            meta: null,
        },
        sections,
    );
    panel.trackDispose(
        effect(() => {
            const isActive = activeTab$() === tabKey;
            panel.setAttr(ATTR_HIDDEN, isActive ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    return panel;
}

export function buildContent(): Instance {
    return div(
        baseProps([CONTENT_CLASS]),
        TABS.map((t) => buildTabPanel(t.key, t.concerns)),
    );
}
