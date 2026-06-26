export interface NotificationRow {
    id: number;
    site_account_id: string;
    kind: string;
    title: string;
    body: string;
    href: string | null;
    dismissed: number;
    created_at: number;
}
