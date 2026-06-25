import { GD_DAY, GD_NAV_BTN, ATTR_DATE, ATTR_NAV_DIR } from "./build.js";
import type { GlassDateParts } from "./date-parts-types.js";

const EVT_CLICK = "click";

function navigatePopupMonth(parts: GlassDateParts, dir: number): void {
    parts.state.view = new Date(Date.UTC(parts.state.view.getUTCFullYear(), parts.state.view.getUTCMonth() + dir, 1));
    parts.renderPopup();
}

export function wirePopupClicks(parts: GlassDateParts, closeFn: () => void): void {
    const setValue = (iso: string): void => {
        parts.state.selected = iso;
        parts.hidden.el.value = iso;
        parts.hidden.el.dispatchEvent(new Event("change", { bubbles: true }));
        parts.labelInst.setText(iso.length > 0 ? iso : parts.state.placeholder);
        parts.onChange?.(iso);
    };
    parts.popup.el.addEventListener(EVT_CLICK, (e) => {
        const target = e.target as HTMLElement;
        const navBtn = target.closest<HTMLElement>(`.${GD_NAV_BTN}`);
        if (navBtn) {
            navigatePopupMonth(parts, Number(navBtn.getAttribute(ATTR_NAV_DIR) ?? "0"));
            return;
        }
        const dayBtn = target.closest<HTMLElement>(`.${GD_DAY}`);
        if (dayBtn) {
            setValue(dayBtn.getAttribute(ATTR_DATE) ?? "");
            closeFn();
        }
    });
}
