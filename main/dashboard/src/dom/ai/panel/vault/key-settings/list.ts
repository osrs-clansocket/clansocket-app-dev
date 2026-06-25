import { div } from "../../../../factory/layout-ops/index.js";
import { BTN_VARIANT_OUTLINE, button, paragraph } from "../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../factory/core/index.js";
import { listProviders } from "../../../../../ai/vault/vault/index.js";
import { EMPTY_CLASS, FORM_ROW_CLASS, LIST_CLASS, type UnlockedSub } from "./constants.js";
import { buildListRow } from "./list-row.js";

async function buildListBody(
    providers: string[],
    setSub: (next: UnlockedSub) => void,
    rerender: () => Promise<void>,
): Promise<Instance> {
    if (providers.length === 0) {
        return paragraph({ classes: [EMPTY_CLASS], text: "No keys.", context: null, meta: null });
    }
    const list = div({ classes: [LIST_CLASS], context: null, meta: null });
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
        compact: true,
        text: "Add key",
        context: "add a new provider API key",
        meta: ["action"],
        onClick: () => {
            setSub({ mode: "add" });
            rerender().catch(() => undefined);
        },
    });
    div({ classes: [FORM_ROW_CLASS], context: null, meta: null }, [addBtn]).mount(footerHost);
}
