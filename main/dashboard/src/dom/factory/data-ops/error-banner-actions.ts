import { icon } from "../content-ops/graphics/media.js";
import { button, BTN_VARIANT_BARE } from "../content-ops/button.js";
import type { Instance } from "../core";
import {
    ERROR_BANNER_ACTION_CLASS,
    ERROR_BANNER_ACTION_DISMISS,
    ERROR_BANNER_ACTION_HOME,
    ERROR_BANNER_ACTION_RELOAD,
    ERROR_BANNER_BACK_ICON,
    ERROR_BANNER_BACK_LABEL,
    ERROR_BANNER_DISMISS_ICON,
    ERROR_BANNER_DISMISS_LABEL,
    ERROR_BANNER_HOME_ICON,
    ERROR_BANNER_HOME_LABEL,
    ERROR_BANNER_HOME_PATH,
    ERROR_BANNER_ICONBTN_CLASS,
    ERROR_BANNER_RELOAD_ICON,
    ERROR_BANNER_RELOAD_LABEL,
    type ErrorBannerAction,
} from "../../../shared/constants/error-banner-constants.js";

const ACTION_ICONS: Record<Exclude<ErrorBannerAction, "none">, string> = {
    dismiss: ERROR_BANNER_DISMISS_ICON,
    home: ERROR_BANNER_HOME_ICON,
    reload: ERROR_BANNER_RELOAD_ICON,
    back: ERROR_BANNER_BACK_ICON,
};

const ACTION_LABELS: Record<Exclude<ErrorBannerAction, "none">, string> = {
    dismiss: ERROR_BANNER_DISMISS_LABEL,
    home: ERROR_BANNER_HOME_LABEL,
    reload: ERROR_BANNER_RELOAD_LABEL,
    back: ERROR_BANNER_BACK_LABEL,
};

function buildActionHandler(
    action: Exclude<ErrorBannerAction, "none">,
    bannerEl: HTMLElement,
    onDismiss: (() => void) | undefined,
): () => void {
    if (action === ERROR_BANNER_ACTION_DISMISS) {
        return () => {
            if (onDismiss !== undefined) onDismiss();
            else bannerEl.remove();
        };
    }
    if (action === ERROR_BANNER_ACTION_HOME) {
        return () => {
            window.location.href = ERROR_BANNER_HOME_PATH;
        };
    }
    if (action === ERROR_BANNER_ACTION_RELOAD) {
        return () => {
            window.location.reload();
        };
    }
    return () => {
        window.history.back();
    };
}

export function buildActionButton(
    action: Exclude<ErrorBannerAction, "none">,
    bannerEl: HTMLElement,
    onDismiss: (() => void) | undefined,
): Instance<HTMLButtonElement> {
    const handler = buildActionHandler(action, bannerEl, onDismiss);
    const iconInst = icon({
        name: ACTION_ICONS[action],
        ariaHidden: true,
        context: null,
        meta: null,
    });
    return button(
        {
            classes: [ERROR_BANNER_ICONBTN_CLASS, ERROR_BANNER_ACTION_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: ACTION_LABELS[action],
            context: null,
            meta: null,
            onClick: handler,
        },
        [iconInst],
    );
}
