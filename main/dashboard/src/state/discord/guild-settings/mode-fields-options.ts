export const VERIFICATION_OPTIONS = [
    { value: "0", label: "0 — None" },
    { value: "1", label: "1 — Low (verified email)" },
    { value: "2", label: "2 — Medium (registered 5+ minutes)" },
    { value: "3", label: "3 — High (member 10+ minutes)" },
    { value: "4", label: "4 — Highest (verified phone)" },
] as const;

export const AFK_TIMEOUT_OPTIONS = [
    { value: "60", label: "1 minute" },
    { value: "300", label: "5 minutes" },
    { value: "900", label: "15 minutes" },
    { value: "1800", label: "30 minutes" },
    { value: "3600", label: "1 hour" },
] as const;

export function parseNum(s: string): number | null {
    if (s.length === 0) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}
