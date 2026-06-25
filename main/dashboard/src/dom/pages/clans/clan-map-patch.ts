import { image, rsnTag, type Instance } from "../../factory";
import type { PositionRow } from "../../../state/clans/stores/positions-store.js";
import { combatLines, prayerSpriteSrc } from "../../clans/clan-map/names/names.js";
import { CLAN_MAP_ROW_PRAYER_ICON_CLASS } from "../../../shared/constants/clan/clan-map-constants.js";
import type { RowRefs } from "./render-map-row.js";

function patchRsnTag(refs: RowRefs, row: PositionRow): void {
    if (row.latest_rsn === refs.currentRsn) return;
    refs.currentRsn = row.latest_rsn;
    const newTag = rsnTag({ rsn: row.latest_rsn, context: null, meta: null });
    refs.rsnTagInst.destroy();
    refs.topLine.addFirst(newTag);
    refs.rsnTagInst = newTag;
}

function patchMetaRow(refs: RowRefs, row: PositionRow): void {
    const showWorld = row.world !== null;
    refs.worldInst.el.style.display = showWorld ? "" : "none";
    if (showWorld) refs.worldInst.setText(`W${row.world}`);
    const activity = row.activity;
    const showActivity = activity !== null && activity.length > 0;
    refs.activityInst.el.style.display = showActivity ? "" : "none";
    if (showActivity) refs.activityInst.setText(activity);
    refs.metaGroup.el.style.display = showWorld || showActivity ? "" : "none";
}

function patchCombatLine(refs: RowRefs, row: PositionRow): { line: ReturnType<typeof combatLines>[number] | null } {
    const lines = combatLines(row, Date.now());
    const line = lines.length > 0 ? lines[0] : null;
    if (line === null) {
        refs.combatInst.el.style.display = "none";
        return { line };
    }
    refs.combatNameInst.setText(line.target);
    const hasDmg = line.dealt !== null;
    refs.combatDmgInst.setText(hasDmg ? `−${line.dealt ?? 0}` : "");
    refs.combatDmgInst.el.style.display = hasDmg ? "" : "none";
    refs.combatIcon.el.style.display = hasDmg ? "" : "none";
    refs.combatInst.el.style.display = "";
    return { line };
}

function syncImages(refs: RowRefs, active: readonly string[]): void {
    const wanted = new Set(active);
    for (const [name, inst] of refs.prayerImgs) {
        if (!wanted.has(name)) {
            inst.detach();
            refs.prayerImgs.delete(name);
        }
    }
    for (const name of active) {
        if (refs.prayerImgs.has(name)) continue;
        const inst: Instance = image({
            src: prayerSpriteSrc(name),
            alt: name,
            title: name,
            classes: [CLAN_MAP_ROW_PRAYER_ICON_CLASS],
            lazy: false,
            context: null,
            meta: null,
        });
        refs.prayerImgs.set(name, inst);
        refs.prayersInst.addChild(inst);
    }
}

export function patchRow(refs: RowRefs, row: PositionRow): void {
    patchRsnTag(refs, row);
    refs.regionInst.setText(row.location_region_name || "—");
    refs.hpInst.setText(`${row.hitpoints}/${row.max_hitpoints}`);
    refs.prayerInst.setText(`${row.prayer}/${row.max_prayer}`);
    patchMetaRow(refs, row);
    syncImages(refs, row.active_prayers);
    const { line } = patchCombatLine(refs, row);
    const hasPrayers = row.active_prayers.length > 0;
    refs.band.el.style.display = hasPrayers || line !== null ? "" : "none";
}
