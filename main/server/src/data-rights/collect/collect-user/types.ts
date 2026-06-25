export type { ZipEntry } from "./zip-entry.js";
export type { ClanRowLite } from "./clan-row-lite.js";

export interface UserCollectionSummary {
    accountHash: string;
    siteAccountId: string;
    exportedAt: number;
    appTables: Record<string, number>;
    discordTables: Record<string, number>;
    clans: Array<{
        clanId: string;
        displayName: string;
        slug: string;
        status: string;
        clanDbTables: Record<string, number>;
        modes: Array<{
            mode: string;
            tables: Record<string, number>;
            assets: number;
        }>;
    }>;
}

export type ClanSummary = UserCollectionSummary["clans"][number];
export type ModeSummary = ClanSummary["modes"][number];
