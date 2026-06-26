import { div, heading, icon, section, type Instance, baseProps } from "../../../factory";
import { POLICY } from "../../../../ai/persona-store/index.js";
import { OPERATION_TAB } from "../../../../state/ai-settings/panel-defs.js";
import type { ConcernDef } from "../../../../state/ai-settings/panel-defs-types.js";
import { ensureDefaultsLoaded } from "../../../../ai/persona-store/defaults-client.js";
import { buildFlatConcernSection } from "../panel/index.js";
import { tabResetBtn } from "../tab-reset.js";

const TAB_CLASS = "ai-settings-operation";
const SECTION_CLASS = "ai-settings-operation__section";
const HEAD_CLASS = "ai-settings-operation__section-head";
const HEAD_ICON_CLASS = "ai-settings-operation__section-icon";
const HEAD_TITLE_CLASS = "ai-settings-operation__section-title";
const FOOTER_CLASS = "ai-settings-operation__footer";

function buildSectionHead(def: ConcernDef): Instance {
    return div(baseProps([HEAD_CLASS]), [
        icon({ name: def.icon, classes: [HEAD_ICON_CLASS], context: null, meta: null }),
        heading("h3", { classes: [HEAD_TITLE_CLASS], text: def.title, context: null, meta: null }),
    ]);
}

function buildFlatSection(def: ConcernDef): Instance {
    return div({ classes: [SECTION_CLASS], data: { "concern-id": def.id }, context: null, meta: null }, [
        buildSectionHead(def),
        buildFlatConcernSection(def),
    ]);
}

export function mount(host: Instance): void {
    void ensureDefaultsLoaded();
    const sections: Instance[] = OPERATION_TAB.concerns.map(buildFlatSection);
    const footer = div(baseProps([FOOTER_CLASS]), [tabResetBtn([POLICY], "operation")]);
    const sec: Instance = section(baseProps([TAB_CLASS]), [...sections, footer]);
    host.setChildren(sec);
}
