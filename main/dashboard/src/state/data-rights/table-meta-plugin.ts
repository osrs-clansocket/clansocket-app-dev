import type { TableMeta } from "./table-meta-types.js";
import { entry } from "./table-meta-types.js";
import {
    COL_EVENT_RECEIVED_AT as EVT,
    COL_ITEM_NAME as NAM,
    COL_QTY_SIGNED as QS,
    COL_UPDATED_AT as UPD,
} from "../../shared/constants/schema-columns.js";

const ASSET_VAULT = "/resources/osrs/game_storage/vault.webp";
const ASSET_INVENTORY = "/resources/osrs/game_tab/equipment.webp";
const ASSET_EQUIPMENT = "/resources/osrs/game_equipment/slot_weapon.webp";
const ASSET_FARMING = "/resources/osrs/game_skill/farming.webp";
const ASSET_SLAYER = "/resources/osrs/game_skill/slayer.webp";
const ASSET_PRAYER = "/resources/osrs/game_prayer/icon_small.webp";
const ASSET_CA = "/resources/osrs/game_combat_achievements/dragon_sword.webp";
const ASSET_PET = "/resources/osrs/icon_pets/baby_chinchompa.webp";
const ASSET_LOOT = "/resources/osrs/icon_item_ids/e3/995.webp";
const ASSET_NPC = "/resources/osrs/icon_hiscores/abyssal_sire.webp";
const ASSET_DIARY = "/resources/osrs/game_tab/quests_green_achievement_diaries.webp";
const ASSET_QUEST = "/resources/osrs/game_tab/quests.webp";
const ASSET_STATS = "/resources/osrs/icon_skills_enlarged/overall_xl.webp";

export const PLUGIN_TABLES: Record<string, TableMeta> = {
    plugin_combat_achievement_catalog: entry("CA catalog", "list-stars", ["task_name", "tier", UPD], ASSET_CA),
    plugin_combat_achievements: entry("combat achievements", "award", ["task_name", "tier", UPD], ASSET_CA),
    plugin_combat_achievements_changes: entry("CA changes", "award", ["task_name", "points_after", EVT], ASSET_CA),
    plugin_connection_status: entry("connection", "wifi", ["session_id", "ws_connected", UPD]),
    plugin_current_state: entry("current state", "activity", ["latest_rsn", "activity", UPD]),
    plugin_damage_buckets: entry("damage", "lightning-charge", ["target_name", "dealt_total", "timestamp"]),
    plugin_deaths: entry("deaths", "exclamation-octagon", ["cause_name", "region_name", EVT]),
    plugin_identity_drifts: entry("identity drifts", "shuffle", ["old_rsn", "new_rsn", EVT]),
    plugin_items_catalog: entry("items catalog", "box", [NAM, "price_gp", "last_seen_at"]),
    plugin_login_state_transitions: entry("login transitions", "box-arrow-in-right", [
        "state_after",
        "state_before",
        EVT,
    ]),
    plugin_loot_drops: entry("loot drops", "gem", [NAM, "cause_name", EVT], ASSET_LOOT),
    plugin_npc_kc: entry("NPC KC", "bullseye", ["source_name", "kc", UPD], ASSET_NPC),
    plugin_pet_drops: entry("pet drops", "heart-fill", ["pet_item_name", "trigger", EVT], ASSET_PET),
    plugin_sessions: entry("plugin sessions", "play-circle", ["rsn", "world", "connected_at"]),
    plugin_world_hops: entry("world hops", "arrow-right-circle", ["from_world", "to_world", EVT]),
    plugin_bank: entry("bank", "bank", [NAM, "qty", UPD], ASSET_VAULT),
    plugin_bank_changes: entry("bank changes", "bank", [NAM, QS, EVT], ASSET_VAULT),
    plugin_inventory: entry("inventory", "box2", [NAM, "qty", UPD], ASSET_INVENTORY),
    plugin_inventory_changes: entry("inventory changes", "box2", [NAM, QS, EVT], ASSET_INVENTORY),
    plugin_equipment: entry("equipment", "shield-fill", [NAM, "slot", UPD], ASSET_EQUIPMENT),
    plugin_equipment_changes: entry("equipment changes", "shield-fill", [NAM, QS, EVT], ASSET_EQUIPMENT),
    plugin_seed_vault: entry("seed vault", "flower3", [NAM, "qty", UPD], ASSET_FARMING),
    plugin_seed_vault_changes: entry("seed vault changes", "flower3", [NAM, QS, EVT], ASSET_FARMING),
    plugin_collection_log: entry("collection log", "book", [NAM, "category", UPD]),
    plugin_collection_log_changes: entry("collection log changes", "journal-text", [NAM, "category", EVT]),
    plugin_stats: entry("stats", "bar-chart", ["skill", "level", UPD], ASSET_STATS),
    plugin_stats_changes: entry("stats changes", "bar-chart", ["skill", "level_after", EVT], ASSET_STATS),
    plugin_prayers: entry("prayers", "star", ["prayer_name", "active", UPD], ASSET_PRAYER),
    plugin_prayers_changes: entry("prayer changes", "star", ["prayer_name", QS, EVT], ASSET_PRAYER),
    plugin_boosts: entry("boosts", "lightning", ["skill", "diff", UPD]),
    plugin_boosts_changes: entry("boost changes", "lightning", ["skill", "diff_after", EVT]),
    plugin_quests: entry("quests", "patch-question", ["quest_name", "state", UPD], ASSET_QUEST),
    plugin_quests_changes: entry("quest changes", "patch-check", ["quest_name", "state_after", EVT], ASSET_QUEST),
    plugin_diaries: entry("diaries", "journal-bookmark", ["diary_name", "tier", UPD], ASSET_DIARY),
    plugin_diaries_changes: entry("diary changes", "journal-check", ["diary_name", "tier_after", EVT], ASSET_DIARY),
    plugin_clues: entry("clues", "trophy", ["tier", "count", UPD]),
    plugin_clues_changes: entry("clue changes", "trophy", ["tier", "count_after", EVT]),
    plugin_status_effects: entry("status effects", "lightning", ["effect", "active", UPD]),
    plugin_status_effects_changes: entry("status effect changes", "lightning", ["effect", QS, EVT]),
    plugin_deaths_lost_items: entry("deaths lost items", "gem", [NAM, "qty"]),
    plugin_farming: entry("farming", "flower3", ["patch_region_name", "crop_name", UPD], ASSET_FARMING),
    plugin_farming_changes: entry(
        "farming changes",
        "flower3",
        ["patch_region_name", "state_after", EVT],
        ASSET_FARMING,
    ),
    plugin_slayer: entry("slayer", "crosshair", ["target_name", "count", UPD], ASSET_SLAYER),
    plugin_slayer_changes: entry(
        "slayer changes",
        "crosshair",
        ["target_name", "count_remaining_after", EVT],
        ASSET_SLAYER,
    ),
};
