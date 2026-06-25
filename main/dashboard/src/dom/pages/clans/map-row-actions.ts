import { BTN_VARIANT_BARE, button, div, effect, icon, span, type Instance } from "../../factory";
import type { PositionRow } from "../../../state/clans/stores/positions-store.js";
import {
    CLAN_MAP_ROW_ACTION_CLASS,
    CLAN_MAP_ROW_ACTION_ICON_CLASS,
    CLAN_MAP_ROW_ACTIONS_CLASS,
    CLAN_MAP_ROW_ALERT_CLASS,
    CLAN_MAP_ROW_FOLLOW_CLASS,
} from "../../../shared/constants/clan/clan-map-constants.js";
import type { RowHandlers } from "./render-map-row.js";

interface RowActionOpts {
    classes: string[];
    iconName: string;
    activeIconName: string;
    isActive$: () => boolean;
    label: string;
    onToggle: () => void;
}

function bindRowActions(btn: Instance, inactiveIcon: Instance, activeIcon: Instance, isActive$: () => boolean): void {
    const dispose = effect(() => {
        const active = isActive$();
        btn.el.classList.toggle("is-active", active);
        inactiveIcon.el.style.display = active ? "none" : "";
        activeIcon.el.style.display = active ? "" : "none";
    });
    btn.trackDispose(dispose);
}

function buildRowAction({ classes, iconName, activeIconName, isActive$, label, onToggle }: RowActionOpts): Instance {
    const inactiveIcon = icon({ name: iconName, ariaHidden: true, context: null, meta: null });
    const activeIcon = icon({ name: activeIconName, ariaHidden: true, context: null, meta: null });
    const iconHost = span({ classes: [CLAN_MAP_ROW_ACTION_ICON_CLASS], context: null, meta: null }, [
        inactiveIcon,
        activeIcon,
    ]);
    const btn = button(
        {
            classes,
            ariaLabel: label,
            variant: BTN_VARIANT_BARE,
            context: label,
            meta: ["action", "clan"],
            onClick: (e: MouseEvent) => {
                e.stopPropagation();
                onToggle();
            },
        },
        [iconHost],
    );
    bindRowActions(btn, inactiveIcon, activeIcon, isActive$);
    return btn;
}

export function buildActionRow(row: PositionRow, h: RowHandlers): Instance {
    const followBtn = buildRowAction({
        classes: [CLAN_MAP_ROW_ACTION_CLASS, CLAN_MAP_ROW_FOLLOW_CLASS],
        iconName: "crosshair",
        activeIconName: "crosshair2",
        isActive$: () => h.followedHash$() === row.account_hash,
        label: `follow ${row.latest_rsn}`,
        onToggle: () => h.onToggleFollow(row.account_hash),
    });
    const alertBtn = buildRowAction({
        classes: [CLAN_MAP_ROW_ACTION_CLASS, CLAN_MAP_ROW_ALERT_CLASS],
        iconName: "bell",
        activeIconName: "bell-fill",
        isActive$: () => h.alertedHashes$().has(row.account_hash),
        label: `alert on ${row.latest_rsn}`,
        onToggle: () => h.onToggleAlert(row.account_hash),
    });
    return div({ classes: [CLAN_MAP_ROW_ACTIONS_CLASS], context: null, meta: null }, [alertBtn, followBtn]);
}
