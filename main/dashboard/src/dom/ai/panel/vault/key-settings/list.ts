import { div } from "../../../../factory/layout-ops/index.js";
import { BTN_VARIANT_OUTLINE, button, paragraph } from "../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../factory/core/index.js";
import { listProviders } from "../../../../../ai/vault/vault/index.js";
import { EMPTY_CLASS, FORM_ROW_CLASS, LIST_CLASS, type UnlockedSub } from "./constants.js";
import { buildListRow } from "./list-row.js";
import { baseProps, textProps } from "../../../../factory/index.js";

async function buildListBody(
    providers: string[],
    setSub: (next: UnlockedSub) => void,
    rerender: () => Promise<void>,
): Promise<Instance> {
    if (providers.length === 0) {
        return paragraph(textProps([EMPTY_CLASS], "No keys."));
    }
    const list = div(baseProps([LIST_CLASS]));
    const total = providers.length;
    for (let i = 0; i < total; i++) {
        list.addChild(await buildListRow({ provider: providers[i]!, idx: i, total, setSub, rerender }));
    }
    return list;
}

export async function renderListView(
    bodyHost: HTMLElement,
    footerHost: HTMLElement,
    setSub: (next: UnlockedSub) => void,
    rerender: () => Promise<void>,
): Promise<void> {
    const providers = await listProviders();
    (await buildListBody(providers, setSub, rerender)).mount(bodyHost);
    const addBtn = button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Add key",
        context: "add a new provider API key",
        meta: ["action"],
        onClick: () => {
            setSub({ mode: "add" });
            rerender().catch(() => undefined);
        },
    });
    div(baseProps([FORM_ROW_CLASS]), [addBtn]).mount(footerHost);
}
