import { type Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { applyTweakerVisibility } from "./tweaker-visibility.js";
import { subscribeTweakerCtrl } from "./tweaker-subscribe.js";
import { buildTweakerRow } from "./tweaker-layout.js";
import { assembleTweaker, buildVisRefs } from "./tweaker-assemble.js";

export function buildAvatarTweaker(ctrl: BrandingController): Instance {
    const kit = assembleTweaker(ctrl);
    const applyKindVisibility = (): void => applyTweakerVisibility(buildVisRefs(ctrl, kit));
    applyKindVisibility();
    subscribeTweakerCtrl({
        ctrl,
        applyKindVisibility,
        sliders: kit.sliders,
        render: kit.render,
        refreshSource: kit.refreshSource,
        statusEl: kit.statusEl,
    });
    kit.block.setChildren(kit.labelEl, kit.bodyEl, buildTweakerRow(kit.actions));
    requestAnimationFrame(() => kit.render());
    return kit.block;
}
