import { SQL_COLUMNS } from "../../../database/core/sql-columns.js";
import type { AssetExtractor, ChildTable, UserTableColumn } from "./types.js";

export const PLUGIN_USER_TABLES: readonly UserTableColumn[] = [
    { table: "plugin_combat_achievements", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_combat_achievements_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_connection_status", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_current_state", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_damage_buckets", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_deaths", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_identity_drifts", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_login_state_transitions", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_loot_drops", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_npc_kc", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_pet_drops", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_sessions", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_world_hops", column: SQL_COLUMNS.ACCOUNT_HASH },

    { table: "plugin_bank", column: SQL_COLUMNS.ACCOUNT_HASH, browseOrder: ["bank_tab", "slot"] },
    { table: "plugin_bank_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_inventory", column: SQL_COLUMNS.ACCOUNT_HASH, browseOrder: ["container_kind", "slot"] },
    { table: "plugin_inventory_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_equipment", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_equipment_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_seed_vault", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_seed_vault_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_collection_log", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_collection_log_changes", column: SQL_COLUMNS.ACCOUNT_HASH },

    { table: "plugin_stats", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_stats_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_prayers", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_prayers_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_boosts", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_boosts_changes", column: SQL_COLUMNS.ACCOUNT_HASH },

    { table: "plugin_quests", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_quests_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_diaries", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_diaries_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_clues", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_clues_changes", column: SQL_COLUMNS.ACCOUNT_HASH },

    { table: "plugin_status_effects", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_status_effects_changes", column: SQL_COLUMNS.ACCOUNT_HASH },

    { table: "plugin_farming", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_farming_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_slayer", column: SQL_COLUMNS.ACCOUNT_HASH },
    { table: "plugin_slayer_changes", column: SQL_COLUMNS.ACCOUNT_HASH },
];

export const PLUGIN_USER_CHILD_TABLES: readonly ChildTable[] = [
    {
        table: "plugin_deaths_lost_items",
        parentTable: "plugin_deaths",
        parentColumn: "id",
        parentKey: "death_id",
    },
];

export const PLUGIN_USER_TABLE_BY_NAME: Readonly<Record<string, (typeof PLUGIN_USER_TABLES)[number]>> = Object.freeze(
    Object.fromEntries(PLUGIN_USER_TABLES.map((cfg) => [cfg.table, cfg])),
);

export const PLUGIN_ASSET_TABLES: readonly AssetExtractor[] = [];

export const PLUGIN_ASSET_BY_TABLE: Readonly<Record<string, AssetExtractor>> = Object.freeze({});

export const PLUGIN_CATALOG_TABLES: readonly string[] = ["plugin_items_catalog", "plugin_combat_achievement_catalog"];
