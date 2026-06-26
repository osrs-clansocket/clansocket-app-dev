import { div } from "../../../factory/layout-ops";
import { icon } from "../../../factory/content-ops/graphics/media.js";
import { button } from "../../../factory/content-ops";
import { effect, type signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import {
    MAP_MINIMAP_TOGGLE_CLASS,
    MAP_MINIMAP_TOGGLE_ICON_CLASS,
} from "../../../../shared/constants/clan/clan-map-constants.js";
import { baseProps } from "../../../factory/index.js";

function buildToggleIcons(): { eyeIcon: Instance; eyeSlashIcon: Instance; iconHost: Instance } {
    const eyeIcon = icon({ name: "eye", ariaHidden: true, context: null, meta: null });
    const eyeSlashIcon = icon({ name: "eye-slash", ariaHidden: true, context: null, meta: null });
    const iconHost = div(baseProps([MAP_MINIMAP_TOGGLE_ICON_CLASS]), [eyeIcon, eyeSlashIcon]);
    return { eyeIcon, eyeSlashIcon, iconHost };
}

export function buildToggleBtn(collapsed$: ReturnType<typeof signal<boolean>>): Instance {
    const { eyeIcon, eyeSlashIcon, iconHost } = buildToggleIcons();
    const toggleBtn = button(
        {
            ariaLabel: "Toggle minimap",
            variant: "bare",
            classes: [MAP_MINIMAP_TOGGLE_CLASS],
            onClick: () => collapsed$.set(!collapsed$()),
            context: "toggle minimap visibility",
            meta: ["action"],
        },
        [iconHost],
    );
    toggleBtn.trackDispose(
        effect(() => {
            const collapsed = collapsed$();
            eyeIcon.el.style.display = collapsed ? "" : "none";
            eyeSlashIcon.el.style.display = collapsed ? "none" : "";
        }),
    );
    return toggleBtn;
}
