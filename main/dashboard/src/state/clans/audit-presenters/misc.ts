import { pload, ploadNum, shortId, type Presenter } from "./types.js";

const READ_ACTIONS = [
    "server:read.managers",
    "server:read.manager_requests",
    "server:read.audit_log",
    "server:read.roster_diffs",
    "server:read.whitelist",
];

const readPresenter: Presenter = (entry) => {
    const noun = entry.action.slice("server:read.".length).replace("_", " ");
    return {
        title: `Read ${noun}`,
        detail: "",
        icon: { provider: "bi", name: "eye" },
        semantic: "read",
        hasExpansion: false,
    };
};

const READ_PRESENTERS: Record<string, Presenter> = Object.fromEntries(READ_ACTIONS.map((a) => [a, readPresenter]));

export const MISC_PRESENTERS: Record<string, Presenter> = {
    "server:roster.changed": (entry) => {
        const members = ploadNum(entry, "memberCount") ?? 0;
        const diffs = ploadNum(entry, "diffCount") ?? 0;
        return {
            title: "Roster changed",
            detail: diffs === 0 ? `${members} members, no diffs` : `${members} members, ${diffs} diffs`,
            icon: { provider: "bi", name: "people-fill" },
            semantic: "write",
            hasExpansion: diffs > 0,
        };
    },
    "server:branding.updated": () => ({
        title: "Branding updated",
        detail: "Click to view diff",
        icon: { provider: "bi", name: "palette-fill" },
        semantic: "write",
        hasExpansion: true,
    }),
    "server:whitelist.added": (entry) => {
        const kind = pload(entry, "kind");
        const value = pload(entry, "value");
        const label = pload(entry, "label");
        const head = kind && value ? `${kind}: ${value}` : (value ?? "");
        return {
            title: "Whitelist added",
            detail: label ? `${head} · "${label}"` : head,
            icon: { provider: "bi", name: "list-check" },
            semantic: "write",
            hasExpansion: false,
        };
    },
    "server:whitelist.removed": (entry) => ({
        title: "Whitelist removed",
        detail: shortId(entry.targetId),
        icon: { provider: "bi", name: "list-ul" },
        semantic: "destructive",
        hasExpansion: false,
    }),
    ...READ_PRESENTERS,
};
