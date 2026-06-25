import "../../../../../styles/pages/clans/manage/clan-plugin-data-page.css";
import { div, paragraph, type Instance } from "../../../../factory";
import { renderDataRights } from "../../../routes/data-rights";

const ROOT_CLASS = "clans-manage__plugin-data";
const LOADING_CLASS = "clans-manage__plugin-data-loading";
const LOADING_TEXT = "Loading plugin data…";

function buildLoading(): Instance {
    return paragraph({ classes: [LOADING_CLASS], text: LOADING_TEXT, context: null, meta: null });
}

import { defineManageTab } from "../registry";

defineManageTab({ key: "plugin-data", build: (slug) => pluginDataTab(slug), order: 50 });

export function pluginDataTab(slug: string): HTMLElement {
    const host = div({ classes: [ROOT_CLASS], context: null, meta: null }, [buildLoading()]);
    void renderDataRights({ clanFilter: slug, embedded: true }).then((inst) => {
        host.setChildren(inst);
    });
    return host.el;
}
