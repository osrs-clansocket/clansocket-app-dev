import { actionGate } from "../../../lifecycle/action-gate.js";

export function actionCooldownsSection(siteAccountId: string): string {
    return `[PROMPT: action-cooldowns]\n## Action Cooldowns\n${actionGate.formatCooldowns(siteAccountId)}`;
}
