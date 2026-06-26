import { pload, shortId, type Presenter } from "./types.js";

function nameSlugDetail(name: string | null, slug: string | null): string {
    if (name !== null && slug !== null) return `${name} (${slug})`;
    return name ?? slug ?? "";
}

export const CLAIM_PRESENTERS: Record<string, Presenter> = {
    "server:claim.completed": (entry) => {
        const name = pload(entry, "displayName");
        const slug = pload(entry, "slug");
        return {
            title: "Clan claimed",
            detail: nameSlugDetail(name, slug),
            icon: { provider: "bi", name: "shield-check" },
            semantic: "write",
            hasExpansion: false,
        };
    },
    "server:claim.transferred": (entry) => {
        const newOwner = pload(entry, "newOwnerSiteAccountId");
        return {
            title: "Ownership transferred",
            detail: newOwner ? `to ${shortId(newOwner)}` : "",
            icon: { provider: "bi", name: "arrow-left-right" },
            semantic: "write",
            hasExpansion: true,
        };
    },
    "server:claim.consent_requested": (entry) => {
        const rsn = pload(entry, "declaredRsn");
        const name = pload(entry, "declaredClanName");
        return {
            title: "Claim consent requested",
            detail: name ? `${rsn ?? "?"} → ${name}` : `RSN: ${rsn ?? "?"}`,
            icon: { provider: "bi", name: "envelope-paper" },
            semantic: "write",
            hasExpansion: false,
        };
    },
    "server:claim.consent_confirmed": (entry) => {
        const rsn = pload(entry, "declaredRsn");
        return {
            title: "Claim consent confirmed",
            detail: rsn ? `RSN: ${rsn}` : "",
            icon: { provider: "bi", name: "shield-check" },
            semantic: "write",
            hasExpansion: false,
        };
    },
    "server:claim.consent_rejected": (entry) => {
        const rsn = pload(entry, "declaredRsn");
        return {
            title: "Claim consent rejected",
            detail: rsn ? `RSN: ${rsn}` : "",
            icon: { provider: "bi", name: "shield-x" },
            semantic: "destructive",
            hasExpansion: false,
        };
    },
};
