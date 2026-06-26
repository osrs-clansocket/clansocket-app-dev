import "../../../../../styles/pages/clans/manage/clan-plugin-data-page.css";
import { div, paragraph, type Instance, baseProps, textProps } from "../../../../factory";
import { renderDataRights } from "../../../routes/data-rights";

const ROOT_CLASS = "clans-manage__plugin-data";
const LOADING_CLASS = "clans-manage__plugin-data-loading";
const LOADING_TEXT = "Loading plugin data…";

function buildLoading(): Instance {
    return paragraph(textProps([LOADING_CLASS], LOADING_TEXT));
}

export function build(slug: string): HTMLElement {
    const host = div(baseProps([ROOT_CLASS]), [buildLoading()]);
    void renderDataRights({ clanFilter: slug, embedded: true }).then((inst) => {
        host.setChildren(inst);
    });
    return host.el;
}
