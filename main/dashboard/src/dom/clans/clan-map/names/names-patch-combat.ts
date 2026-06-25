import type { CombatLine } from "./names-combat.js";
import type { CardRefs } from "./names-card.js";

export function patchCombat(card: CardRefs, line: CombatLine | null): void {
    if (line === null) {
        card.combatNameInst.setText("");
        card.combatDmgInst.setText("");
        card.combatDmgInst.el.style.display = "none";
        card.combatIcon.el.style.display = "none";
        return;
    }
    card.combatNameInst.setText(line.target);
    const hasDmg = line.dealt !== null;
    if (hasDmg) {
        card.combatDmgInst.setText(`−${line.dealt ?? 0}`);
        card.combatDmgInst.el.style.display = "";
        card.combatIcon.el.style.display = "";
    } else {
        card.combatDmgInst.setText("");
        card.combatDmgInst.el.style.display = "none";
        card.combatIcon.el.style.display = "none";
    }
}
