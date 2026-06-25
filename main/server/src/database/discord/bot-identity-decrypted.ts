export interface BotIdentityDecrypted {
    bot_id: string;
    bot_name: string | null;
    application_id: string;
    application_name: string;
    owner_kind: string;
    owner_site_account_id: string | null;
    clan_id: string | null;
    clan_name: string | null;
    token: string;
    public_key: string | null;
    intents_bitfield: number;
    active_presence_template_id: string | null;
}
