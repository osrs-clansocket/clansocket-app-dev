import { button, icon, type Instance } from "../../../factory";

const CLOSE_CLASS = "clans-home__popover-close";

export function popoverCloseBtn(onClose: () => void): Instance {
    return button(
        {
            classes: [CLOSE_CLASS],
            ariaLabel: "Close",
            title: "Close",
            context: "close this popover",
            meta: ["action"],
            onClick: onClose,
        },
        [icon({ name: "x-lg", context: null, meta: null }).el],
    );
}
