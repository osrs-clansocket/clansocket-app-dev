import { div, type Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { clanModelIcon } from "../../../../../factory/data-ops/identity/clan-model-icon.js";
import { TWEAKER_CANVAS_CLASS } from "../../../../../../shared/constants/branding-tweaker-constants.js";

export function buildTweakerHost(ctrl: BrandingController): Instance {
    const host = ctrl.clan.slug
        ? clanModelIcon({
              slug: ctrl.clan.slug,
              imageVersion: ctrl.imageVersion,
              initialTransform: ctrl.transform,
              context: null,
              meta: null,
          })
        : div({ classes: [], context: null, meta: null });
    host.el.classList.add(TWEAKER_CANVAS_CLASS);
    host.el.hidden = true;
    return host;
}
