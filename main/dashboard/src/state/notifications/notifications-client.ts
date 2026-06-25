import { identityClient } from "../identity/identity-client/index.js";
import { jsonOrFallback } from "../fetch-result.js";

export interface AppNotification {
    id: number;
    kind: string;
    title: string;
    body: string;
    href: string | null;
    createdAt: number;
}

export const notificationsClient = {
    async list(): Promise<AppNotification[]> {
        const res = await identityClient.authedFetch("/api/me/notifications", { method: "GET" });
        const data = await jsonOrFallback<{ notifications?: AppNotification[] }>(res, {});
        return data.notifications ?? [];
    },
    async dismiss(id: number): Promise<boolean> {
        const res = await identityClient.authedFetch(`/api/me/notifications/${id}/dismiss`, { method: "POST" });
        return res.ok;
    },
};
