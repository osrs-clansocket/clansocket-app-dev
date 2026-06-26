import "../../../../../styles/pages/account/index.css";
import "../../../../../styles/pages/clans/manage/identity/clan-identity-page.css";
import { div, heading, baseProps } from "../../../../factory";
import { clansStore } from "../../../../../state/clans/stores/clans-store.js";
import { buildBrandingControls } from "../../../account/branding/branding-controls.js";
import { buildSeoPanel } from "./seo-panel.js";
import {
    ACCOUNT_CLAN_BRANDING_SECTION_CLASS,
    ACCOUNT_PANEL_TITLE_CLASS,
} from "../../../../../shared/constants/account-constants.js";

const ROOT_CLASS = "clans-manage__identity";
const SHELL_CLASS = "clans-manage-shell";

export function build(slug: string): HTMLElement {
    const host = div(baseProps([ROOT_CLASS, SHELL_CLASS]));
    const clan = clansStore.managed$().find((c) => c.slug === slug);
    if (clan === undefined) return host.el;
    host.setChildren(
        div(baseProps([ACCOUNT_CLAN_BRANDING_SECTION_CLASS]), [
            heading("h3", { classes: [ACCOUNT_PANEL_TITLE_CLASS], text: "Branding", context: null, meta: null }),
            buildBrandingControls(clan),
        ]),
        buildSeoPanel(slug),
    );
    return host.el;
}
