import { signal, type Signal } from "../../dom/factory";
import { fetchCapabilities, type CapabilitySummary } from "./flows-client.js";

export const capabilitiesSignal: Signal<readonly CapabilitySummary[]> = signal<readonly CapabilitySummary[]>([]);

let loaded = false;

export async function ensureCapabilitiesLoaded(): Promise<void> {
    if (loaded) return;
    loaded = true;
    try {
        const response = await fetchCapabilities();
        capabilitiesSignal.set(response.capabilities);
    } catch {
        loaded = false;
    }
}

export interface TriggerOption {
    readonly value: string;
    readonly label: string;
    readonly group: string;
}

const FALLBACK_TRIGGERS: readonly TriggerOption[] = [
    { value: "discord:channels.created", group: "discord", label: "channels.created" },
    { value: "discord:channels.updated", group: "discord", label: "channels.updated" },
    { value: "discord:channels.deleted", group: "discord", label: "channels.deleted" },
    { value: "discord:members.joined", group: "discord", label: "members.joined" },
    { value: "discord:members.left", group: "discord", label: "members.left" },
    { value: "discord:members.banned", group: "discord", label: "members.banned" },
    { value: "discord:roles.created", group: "discord", label: "roles.created" },
    { value: "discord:roles.assigned", group: "discord", label: "roles.assigned" },
    { value: "discord:roles.removed", group: "discord", label: "roles.removed" },
    { value: "discord:messages.reacted", group: "discord", label: "messages.reacted" },
    { value: "discord:voice.joined", group: "discord", label: "voice.joined" },
    { value: "discord:voice.left", group: "discord", label: "voice.left" },
    { value: "discord:threads.created", group: "discord", label: "threads.created" },
    { value: "discord:events.started", group: "discord", label: "events.started" },
    { value: "plugin:skillReached", group: "plugin", label: "skillReached" },
    { value: "plugin:skillReached99", group: "plugin", label: "skillReached99" },
    { value: "plugin:skillReached200m", group: "plugin", label: "skillReached200m" },
    { value: "plugin:maxLevelReached", group: "plugin", label: "maxLevelReached" },
    { value: "plugin:bossKilled", group: "plugin", label: "bossKilled" },
    { value: "plugin:firstKill", group: "plugin", label: "firstKill" },
    { value: "plugin:kcMilestone", group: "plugin", label: "kcMilestone" },
    { value: "plugin:dropObtained", group: "plugin", label: "dropObtained" },
    { value: "plugin:rareDropObtained", group: "plugin", label: "rareDropObtained" },
    { value: "plugin:petObtained", group: "plugin", label: "petObtained" },
    { value: "plugin:collectionLogSlot", group: "plugin", label: "collectionLogSlot" },
    { value: "plugin:clueCompleted", group: "plugin", label: "clueCompleted" },
    { value: "plugin:diaryCompleted", group: "plugin", label: "diaryCompleted" },
    { value: "plugin:combatAchievementUnlocked", group: "plugin", label: "combatAchievementUnlocked" },
    { value: "plugin:questCompleted", group: "plugin", label: "questCompleted" },
    { value: "plugin:questCape", group: "plugin", label: "questCape" },
    { value: "plugin:maxCape", group: "plugin", label: "maxCape" },
    { value: "plugin:raidCompleted", group: "plugin", label: "raidCompleted" },
    { value: "plugin:personalBest", group: "plugin", label: "personalBest" },
    { value: "plugin:deathOccurred", group: "plugin", label: "deathOccurred" },
    { value: "plugin:tradeCompleted", group: "plugin", label: "tradeCompleted" },
    { value: "plugin:loginDetected", group: "plugin", label: "loginDetected" },
    { value: "plugin:logoutDetected", group: "plugin", label: "logoutDetected" },
    { value: "plugin:screenshotPosted", group: "plugin", label: "screenshotPosted" },
    { value: "wom:competitionStarted", group: "wom", label: "competitionStarted" },
    { value: "wom:competitionEnded", group: "wom", label: "competitionEnded" },
    { value: "wom:hiscoreRankChanged", group: "wom", label: "hiscoreRankChanged" },
    { value: "wom:groupUpdated", group: "wom", label: "groupUpdated" },
    { value: "clansocket:memberAddedToClan", group: "clansocket", label: "memberAddedToClan" },
    { value: "clansocket:memberLeftClan", group: "clansocket", label: "memberLeftClan" },
    { value: "clansocket:memberRankPromoted", group: "clansocket", label: "memberRankPromoted" },
    { value: "clansocket:memberRankDemoted", group: "clansocket", label: "memberRankDemoted" },
    { value: "clansocket:memberWentInactive", group: "clansocket", label: "memberWentInactive" },
    { value: "clansocket:memberReturned", group: "clansocket", label: "memberReturned" },
    { value: "clansocket:clanTenureMilestone", group: "clansocket", label: "clanTenureMilestone" },
    { value: "clansocket:clanEventScheduled", group: "clansocket", label: "clanEventScheduled" },
    { value: "clansocket:clanEventStarted", group: "clansocket", label: "clanEventStarted" },
    { value: "clansocket:clanEventEnded", group: "clansocket", label: "clanEventEnded" },
    { value: "clansocket:rsvpReceived", group: "clansocket", label: "rsvpReceived" },
];

export function flatTriggerOptions(): readonly TriggerOption[] {
    const fromRegistry: TriggerOption[] = [];
    for (const capability of capabilitiesSignal()) {
        for (const [triggerId, spec] of Object.entries(capability.triggers)) {
            if (!spec.triggerable) continue;
            fromRegistry.push({ value: triggerId, label: triggerId, group: capability.name });
        }
    }
    if (fromRegistry.length === 0) return FALLBACK_TRIGGERS;
    const seen = new Set(fromRegistry.map((o) => o.value));
    const extras = FALLBACK_TRIGGERS.filter((t) => !seen.has(t.value));
    return [...fromRegistry, ...extras];
}
