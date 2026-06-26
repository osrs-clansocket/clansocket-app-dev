import { div, section, type Instance, baseProps } from "../../../factory";
import { ensureDefaultsLoaded } from "../../../../ai/persona-store/defaults-client.js";
import type { SlotTier } from "../../../../ai/persona-store/index.js";
import type { TabConcerns } from "../../../../state/ai-settings/panel-defs.js";
import { buildConcernSection } from "./panel/index.js";
import { tabResetBtn } from "./tab-reset.js";

export { hasOwn } from "../../../../ai/persona-store/index.js";
export { ATTR_HIDDEN, HIDDEN_TRUE, HIDDEN_FALSE } from "../../../../shared/constants/hidden-attr-constants.js";

const ACCORDION_CLASS = "account-ai-settings__accordion";
const TAB_FOOTER_CLASS = "account-ai-settings__tab-footer";

export interface MountOpts {
    host: Instance;
    config: TabConcerns;
    tiers: readonly SlotTier[];
    tierLabel: string;
    tabClass: string;
}

export function mountConcernsTab({ host, config, tiers, tierLabel, tabClass }: MountOpts): void {
    void ensureDefaultsLoaded();
    const accordion = div(baseProps([ACCORDION_CLASS]));
    for (const c of config.concerns) accordion.addChild(buildConcernSection(c));
    const footer = div(baseProps([TAB_FOOTER_CLASS]), [tabResetBtn(tiers, tierLabel)]);
    const sec: Instance = section(baseProps([tabClass]), [accordion, footer]);
    host.setChildren(sec);
}
