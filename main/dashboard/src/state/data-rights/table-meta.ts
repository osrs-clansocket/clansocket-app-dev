import { PLUGIN_TABLES } from "./table-meta-plugin.js";
import { entry, type TableMeta } from "./table-meta-types.js";
export type { TableMeta, TableSummary } from "./table-meta-types.js";

const ASSET_CLAN_CHAT = "/resources/osrs/game_tab/clan_chat.webp";
const ASSET_PLAYER_TYPE = "/resources/osrs/icon_player_types/regular.webp";

const TABLE_META: Record<string, TableMeta> = {
    clansocket_accounts: entry("account", "person-circle", ["display_name", "provider", "last_login_at"]),
    clansocket_account_bindings: entry("account links", "link-45deg", ["rsn", "account_hash", "last_seen_at"]),
    clansocket_account_rsns: entry("RSNs", "person-badge", ["rsn", "current_rank", "last_seen"], ASSET_PLAYER_TYPE),
    clansocket_account_providers: entry("OAuth providers", "box-arrow-in-right", [
        "provider",
        "display_name",
        "linked_at",
    ]),
    clansocket_oauth_sessions: entry("sessions", "shield-lock", ["created_at", "expires_at", "last_used_at"]),
    clansocket_passkeys: entry("passkeys", "key", ["device_name", "sign_count", "last_used_at"]),
    clansocket_backup_codes: entry("backup codes", "shield-check", ["generated_at", "redeemed_at"]),
    clansocket_device_link_codes: entry("device link codes", "phone", ["created_at", "redeemed_at", "expires_at"]),
    clansocket_webauthn_challenges: entry("auth challenges", "shield-shaded", [
        "purpose",
        "display_name",
        "created_at",
    ]),
    clansocket_clans: entry("owned clans", "people-fill", ["display_name", "status", "created_at"]),
    clansocket_clan_managers: entry("manager roles", "award", ["clan_name", "role", "granted_at"]),
    clansocket_clan_manager_requests: entry("manager requests", "send", ["clan_name", "declared_rsn", "requested_at"]),
    clansocket_clan_whitelists: entry("clan whitelists", "list-check", ["clan_name", "entry_value", "added_at"]),
    clansocket_consent_requests: entry("consent requests", "file-text", ["target_rsn", "kind", "created_at"]),
    clansocket_notifications: entry("notifications", "bell", ["title", "kind", "created_at"]),
    clansocket_data_action_log: entry("action log", "clock-history", ["kind", "target_name", "performed_at"]),
    varez_chain_turns: entry("AI chain turns", "arrow-repeat", ["step", "mode", "started_at"]),
    varez_pins: entry("AI pins", "pin-angle", ["pin_id", "auto", "pinned_at"]),
    varez_user_action_log: entry("AI actions", "activity", ["action", "target", "executed_at"]),
    varez_action_log: entry("AI action log", "activity", ["action", "target", "executed_at"]),
    varez_state: entry("AI state", "sliders", ["key", "value", "updated_at"]),
    discord_servers: entry("discord servers", "hdd-network", ["guild_name", "clan_name", "updated_at"]),
    clan_rosters: entry("roster snapshots", "camera", ["captured_by_rsn", "member_count", "captured_at"]),
    clan_members: entry("clan members", "people", ["member_name", "rank", "last_observed_at"]),
    clan_roster_diffs: entry("roster changes", "arrow-left-right", ["member_name", "event_type", "detected_at"]),
    clan_settings: entry("clan settings", "gear", ["key", "value", "updated_at"]),
    clan_eligibility_rules: entry("eligibility rules", "funnel", [
        "rules_json",
        "updated_by_site_account_id",
        "updated_at",
    ]),
    clan_chats: entry("clan chats", "chat-dots", ["sender_rsn", "text", "event_received_at"], ASSET_CLAN_CHAT),
    clan_member_history: entry("clan history", "clock-history", ["rsn", "rank", "last_seen"]),
    clan_snapshots: entry("clan snapshots", "camera", ["member_count", "online_count", "observed_at"]),
    clan_titles_current: entry("clan titles", "award", ["title_name", "rank_position", "observed_at"]),
    clan_titles_history: entry("title changes", "clock-history", [
        "new_title_name",
        "rank_position",
        "event_received_at",
    ]),
    clan_audit_log: entry("audit log", "clock-history", ["action", "target_name", "ts"]),
    clan_audit_settings: entry("audit settings", "gear", ["key", "value", "updated_at"]),
    localStorage: entry("localStorage", "hdd-fill", ["key", "type"]),
    sessionStorage: entry("sessionStorage", "hdd-stack", ["key", "type"]),
    clan_accounts: entry(
        "clan accounts",
        "person-fill-gear",
        ["latest_rsn", "account_type", "last_seen"],
        ASSET_PLAYER_TYPE,
    ),
    ...PLUGIN_TABLES,
};

const TABLE_PREFIXES = ["clansocket_", "plugin_", "varez_", "discord_", "clan_"];

function stripPrefix(table: string): string {
    for (const p of TABLE_PREFIXES) {
        if (table.startsWith(p)) return table.slice(p.length);
    }
    return table;
}

export function tableMeta(table: string): TableMeta {
    const hit = TABLE_META[table];
    if (hit) return hit;
    const label = stripPrefix(table).split("_").join(" ");
    return { label, icon: "table" };
}
