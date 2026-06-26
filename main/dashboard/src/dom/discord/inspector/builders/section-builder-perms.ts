import { div, span, wireChange, type Instance, baseProps, textProps } from "../../../factory";
import { checkbox } from "../../../factory/content-ops/form/inputs/checkbox.js";
import { PERMISSION_FLAG_NAMES } from "../../../../shared/constants/clan-manage-discord/permission-flags-constants.js";
import { formatPermissionName, safeBigInt } from "../util/permission-cycle.js";
import { DISCORD_INSPECTOR_SECTION_CLASS } from "../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildLabelRow } from "./section-builder-readonly.js";

const PERMS_GRID_CLASS = "discord-inspector__perms-grid";
const PERMS_ROW_CLASS = "discord-inspector__perms-row";
const PERMS_LABEL_CLASS = "discord-inspector__perms-row-label";
const PERMS_STATE_CLASS = "discord-inspector__perms-row-state";
const PERM_STATE_SET = "✓";
const PERM_STATE_UNSET = "—";

function readonlyPermRow(label: string, isSet: boolean): Instance {
    const labelEl = span(textProps([PERMS_LABEL_CLASS], label));
    const stateEl = span(textProps([PERMS_STATE_CLASS], isSet ? PERM_STATE_SET : PERM_STATE_UNSET));
    return div(baseProps([PERMS_ROW_CLASS]), [stateEl, labelEl]);
}

interface PermRowMutators {
    getLocal: () => bigint;
    setLocal: (next: bigint) => void;
    onSave: (next: string) => void;
}

function editablePermRow(label: string, mask: bigint, mut: PermRowMutators): Instance {
    const labelEl = span(textProps([PERMS_LABEL_CLASS], label));
    const cb = checkbox({ context: null, meta: null });
    if ((mut.getLocal() & mask) !== 0n) cb.el.checked = true;
    wireChange(cb.el, () => {
        const next = cb.el.checked ? mut.getLocal() | mask : mut.getLocal() & ~mask;
        mut.setLocal(next);
        mut.onSave(next.toString());
    });
    return div(baseProps([PERMS_ROW_CLASS]), [cb, labelEl]);
}

function buildPermRow(name: string, bit: number, editable: boolean, mut: PermRowMutators): Instance {
    const mask = 1n << BigInt(bit);
    const flagLabel = formatPermissionName(name);
    if (!editable) return readonlyPermRow(flagLabel, (mut.getLocal() & mask) !== 0n);
    return editablePermRow(flagLabel, mask, mut);
}

export function editPerms(
    title: string,
    currentBitfield: string,
    editable: boolean,
    onSave: (next: string) => void,
): Instance {
    let local = safeBigInt(currentBitfield);
    const mut: PermRowMutators = {
        getLocal: () => local,
        setLocal: (next) => {
            local = next;
        },
        onSave,
    };
    const rows = PERMISSION_FLAG_NAMES.map((name, bit) => buildPermRow(name, bit, editable, mut));
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [
        buildLabelRow(title, null),
        div(baseProps([PERMS_GRID_CLASS]), rows),
    ]);
}
