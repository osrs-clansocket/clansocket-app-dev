import { button } from "../../content-ops/button.js";
import { icon } from "../../content-ops/graphics/media.js";
import { div } from "../../layout-ops/structural/container.js";
import { INLINE_CONFIRM_HOST_CLASS } from "../../layout-ops/inline/inline-confirm.js";
import type { Instance } from "../../core/index.js";

const TREE_LEAF_ACTION_CLASS = "tree__leaf-action";
const PENCIL_ICON = "pencil";

export interface TreeLeafAction {
    iconName: string;
    title: string;
    onClick: (host: Instance) => void;
    danger?: boolean;
}

function buildLeafAction(action: TreeLeafAction, getHost: () => Instance | null): Instance {
    const classes = action.danger ? [TREE_LEAF_ACTION_CLASS, "is-danger"] : [TREE_LEAF_ACTION_CLASS];
    const meta = action.danger ? (["action", "destructive"] as const) : (["action"] as const);
    return button(
        {
            classes,
            meta,
            type: "button",
            title: action.title,
            ariaLabel: action.title,
            context: action.title,
            onClick: () => {
                const host = getHost();
                if (host !== null) action.onClick(host);
            },
        },
        [icon({ name: action.iconName, context: null, meta: null }).el],
    );
}

export function actionsFor(
    label: string,
    enterEdit: (() => void) | undefined,
    extra: readonly TreeLeafAction[] | undefined,
): TreeLeafAction[] {
    const out: TreeLeafAction[] = [];
    if (enterEdit) {
        out.push({
            iconName: PENCIL_ICON,
            title: `Rename ${label}`,
            onClick: enterEdit,
        });
    }
    if (extra) for (const a of extra) out.push(a);
    return out;
}

export function buildActionsCluster(actions: readonly TreeLeafAction[], containerClass: string): { host: Instance } {
    let hostRef: Instance | null = null;
    const container = div(
        { classes: [containerClass], context: null, meta: null },
        actions.map((a) => buildLeafAction(a, () => hostRef)),
    );
    const host = div({ classes: [INLINE_CONFIRM_HOST_CLASS], context: null, meta: null }, [container]);
    hostRef = host;
    return { host };
}
