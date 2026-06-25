import { button, icon, type Instance, type ReactiveValue } from "../../../factory";
import { DISCORD_INSPECTOR_COPY_BTN_CLASS } from "../../../../shared/constants/clan-manage-discord/route-constants.js";

const COPY_ICON_NAME = "clipboard";

interface CopyEntry {
    title: string;
    value: ReactiveValue<string>;
}

function readValue(v: ReactiveValue<string>): string {
    return typeof v === "function" ? (v as () => string)() : v;
}

function buildCopyClipboard(value: string): void {
    void navigator.clipboard.writeText(value).catch(() => undefined);
}

export function buildCopyButton(e: CopyEntry): Instance {
    return button(
        {
            classes: [DISCORD_INSPECTOR_COPY_BTN_CLASS],
            ariaLabel: `Copy ${e.title} to clipboard`,
            context: `copy ${e.title} value to clipboard`,
            meta: ["action", "copy"],
            onClick: () => buildCopyClipboard(readValue(e.value)),
        },
        [icon({ name: COPY_ICON_NAME, context: null, meta: null }).el],
    );
}
