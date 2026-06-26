import { div, effect, icon, paragraph, span, type Instance, baseProps, textProps } from "../../../factory";
import { modesStore } from "../../../../ai/modes-store/index.js";
import { mountMemory } from "../../../ai/memory/inline.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../shared.js";

const BANNER_CLASS = "ai-settings-memory__banner";
const BANNER_ICON_CLASS = "ai-settings-memory__banner-icon";
const BANNER_TEXT_CLASS = "ai-settings-memory__banner-text";

export function mount(host: Instance): void {
    const banner = div({ classes: [BANNER_CLASS], role: "status", context: null, meta: null }, [
        span(baseProps([BANNER_ICON_CLASS]), [icon({ name: "info-circle-fill", context: null, meta: null }).el]),
        paragraph(
            textProps(
                [BANNER_TEXT_CLASS],
                "Memory authoring is off in Modes. Existing notes stay, but the AI cant add new ones.",
            ),
        ),
    ]);
    banner.trackDispose(
        effect(() => {
            const isOn = modesStore.isOn("mode_memory_authoring");
            banner.setAttr(ATTR_HIDDEN, isOn ? HIDDEN_TRUE : HIDDEN_FALSE);
        }),
    );
    const inlineHost = div({ context: null, meta: null });
    host.setChildren(banner, inlineHost);
    mountMemory(inlineHost);
}
