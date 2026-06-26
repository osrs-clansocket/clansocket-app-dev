export interface PasskeyRow {
    id: string;
    site_account_id: string;
    credential_id: string;
    public_key: Buffer;
    sign_count: number;
    device_name: string | null;
    created_at: number;
    last_used_at: number | null;
}
