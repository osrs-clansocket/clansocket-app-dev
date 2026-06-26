import { SQL_TABLES } from "../../../database/core/sql-columns.js";

export const APP_TABLES_BY_CLAN_ID: readonly { table: string; column: string }[] = [
    { table: SQL_TABLES.CLANSOCKET_CLANS, column: "id" },
    { table: SQL_TABLES.CLANSOCKET_CLAN_MANAGERS, column: "clan_id" },
    { table: SQL_TABLES.CLANSOCKET_CLAN_MANAGER_REQUESTS, column: "clan_id" },
    { table: SQL_TABLES.CLANSOCKET_CLAN_WHITELISTS, column: "clan_id" },
];

export const ICON_EXTS: readonly string[] = ["png", "jpg", "jpeg", "webp", "gif", "svg", "ico"];
export const ICON_TRANSFORM_SIDECAR = "icon-customized.transform.json";

export interface ClanCollectionSummary {
    clanId: string;
    displayName: string;
    slug: string;
    status: string;
    exportedAt: number;
    appTables: Record<string, number>;
    clanDbTables: Record<string, number>;
    clanAuditDbTables: Record<string, number>;
    modes: Array<{ mode: string; tables: Record<string, number>; assets: number }>;
    icon: string | null;
}

export type ModeSummary = ClanCollectionSummary["modes"][number];
