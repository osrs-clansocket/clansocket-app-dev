import { clanCol, pluginCol } from "../../database/discord/auto-hook-conditions/col-curries.js";
import type { Resolver } from "../../database/discord/auto-hook-conditions/distinct-resolvers.js";

export interface EntityAttribute {
    readonly path: string;
    readonly label: string;
    readonly type: "string" | "integer" | "boolean" | "timestamp";
    readonly resolver: Resolver | null;
}

const members = clanCol("clan_members");
const accounts = clanCol("clan_accounts");
const stats = pluginCol("plugin_stats");
const npcKc = pluginCol("plugin_npc_kc");
const combatAch = pluginCol("plugin_combat_achievement_catalog");
const diaries = pluginCol("plugin_diaries");
const clues = pluginCol("plugin_clues");
const colLog = pluginCol("plugin_collection_log");
const pets = pluginCol("plugin_pet_drops");
const quests = pluginCol("plugin_quests");

const ATTRIBUTES: readonly EntityAttribute[] = [
    { path: "entity.rsn", label: "RSN", type: "string", resolver: members("member_name") },
    { path: "entity.account.type", label: "Account type", type: "string", resolver: accounts("account_type") },
    { path: "entity.clan.rank", label: "Clan rank", type: "string", resolver: members("rank") },
    { path: "entity.clan.joined_at", label: "Clan join date", type: "timestamp", resolver: null },
    { path: "entity.skills.skill", label: "Skill name", type: "string", resolver: stats("skill") },
    { path: "entity.skills.level", label: "Skill level", type: "integer", resolver: stats("level") },
    { path: "entity.kc.boss", label: "Boss / NPC name", type: "string", resolver: npcKc("source_name") },
    { path: "entity.collection_log.category", label: "Collection log category", type: "string", resolver: colLog("category") },
    { path: "entity.collection_log.item_name", label: "Collection log item", type: "string", resolver: colLog("item_name") },
    { path: "entity.clue_completions.tier", label: "Clue tier", type: "string", resolver: clues("tier") },
    { path: "entity.diary_completions.region", label: "Diary region", type: "string", resolver: diaries("diary_region") },
    { path: "entity.diary_completions.name", label: "Diary name", type: "string", resolver: diaries("diary_name") },
    { path: "entity.diary_completions.tier", label: "Diary tier", type: "string", resolver: diaries("tier") },
    { path: "entity.combat_achievements.tier", label: "Combat achievement tier", type: "string", resolver: combatAch("tier") },
    { path: "entity.combat_achievements.task_name", label: "Combat achievement task", type: "string", resolver: combatAch("task_name") },
    { path: "entity.combat_achievements.boss_name", label: "Combat achievement boss", type: "string", resolver: combatAch("boss_name") },
    { path: "entity.pets.name", label: "Pet item name", type: "string", resolver: pets("pet_item_name") },
    { path: "entity.quests.name", label: "Quest name", type: "string", resolver: quests("quest_name") },
    { path: "entity.quests.status", label: "Quest status", type: "string", resolver: quests("state") },
];

const BY_PATH: ReadonlyMap<string, EntityAttribute> = new Map(ATTRIBUTES.map((a) => [a.path, a]));

export function entityAttributes(): readonly EntityAttribute[] {
    return ATTRIBUTES;
}

export function lookupEntityAttribute(path: string): EntityAttribute | null {
    return BY_PATH.get(path) ?? null;
}
