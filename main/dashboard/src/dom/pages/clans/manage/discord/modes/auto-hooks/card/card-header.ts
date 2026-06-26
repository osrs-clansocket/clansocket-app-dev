import {
    BTN_VARIANT_BARE,
    button,
    div,
    icon,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../../../../../factory";
import { buildGlassCheck } from "../../../../../../../forms/glass/inputs/glass-check.js";
import { editName } from "../../../../../../../clans/account/workflows/display-name-edit.js";
import {
    ACCOUNT_GREETING_EDIT_CLASS,
    ACCOUNT_GREETING_NAME_CLASS,
    ACCOUNT_GREETING_NAME_ROW_CLASS,
} from "../../../../../../../../shared/constants/account-constants.js";
import type { AutoHookRow } from "../../../../../../../../state/discord/auto-hooks/client.js";
import {
    AUTO_HOOKS_CARD_DELETE_CLASS,
    AUTO_HOOKS_CARD_HEADER_CLASS,
    AUTO_HOOKS_CARD_LABEL_CLASS,
    AUTO_HOOKS_EMBED_TOGGLE_CLASS,
    DELETE_BTN_LABEL,
    ENABLED_LABEL,
    NAME_LABEL,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";

export interface CardCallbacks {
    onSave: (next: AutoHookRow) => Promise<void>;
    onToggle: (autoHookId: string, enabled: boolean) => Promise<void>;
    onDelete: (autoHookId: string) => Promise<void>;
}

function buildEditIcon(nameEl: Instance, onSaveName: (n: string) => void): Instance<HTMLButtonElement> {
    const editIcon: Instance<HTMLButtonElement> = button(
        {
            
            classes: [ACCOUNT_GREETING_EDIT_CLASS],
            ariaLabel: `Edit ${NAME_LABEL}`,
            title: `Edit ${NAME_LABEL}`,
            context: "edit the auto-hook display name",
            meta: ["action"],
            onClick: () =>
                editName({
                    nameEl: nameEl.el,
                    iconEl: editIcon.el,
                    ariaLabel: NAME_LABEL,
                    context: "edit the auto-hook display name",
                    onSave: onSaveName,
                }),
        },
        [icon({ provider: "bi", name: "pencil", ariaHidden: true, context: null, meta: null })],
    );
    return editIcon;
}

function buildNameRow(name: string, setName: (n: string) => void): Instance {
    const nameEl = span(textProps([ACCOUNT_GREETING_NAME_CLASS], name));
    const onSaveName = (next: string): void => {
        setName(next);
        nameEl.setText(next);
    };
    const editIcon = buildEditIcon(nameEl, onSaveName);
    return div(baseProps([ACCOUNT_GREETING_NAME_ROW_CLASS]), [nameEl, editIcon]);
}

function buildEnableGroup(row: AutoHookRow, cb: CardCallbacks): Instance {
    const toggleEl = buildGlassCheck({
        name: `enabled-${row.auto_hook_id}`,
        checked: () => row.enabled === 1,
        ariaLabel: ENABLED_LABEL,
        onChange: (next) => void cb.onToggle(row.auto_hook_id, next),
    });
    return div(baseProps([AUTO_HOOKS_EMBED_TOGGLE_CLASS]), [
        span(textProps([AUTO_HOOKS_CARD_LABEL_CLASS], `${ENABLED_LABEL}:`)),
        toggleEl,
    ]);
}

function buildDeleteBtn(row: AutoHookRow, cb: CardCallbacks): Instance {
    return button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [AUTO_HOOKS_CARD_DELETE_CLASS],
            ariaLabel: DELETE_BTN_LABEL,
            context: "delete this auto-hook",
            meta: ["action", "destructive"],
            onClick: () => void cb.onDelete(row.auto_hook_id),
        },
        [icon({ name: "trash", context: null, meta: null }).el],
    );
}

export function buildHeader(name: string, row: AutoHookRow, cb: CardCallbacks, setName: (n: string) => void): Instance {
    return div(baseProps([AUTO_HOOKS_CARD_HEADER_CLASS]), [
        buildNameRow(name, setName),
        buildEnableGroup(row, cb),
        buildDeleteBtn(row, cb),
    ]);
}
