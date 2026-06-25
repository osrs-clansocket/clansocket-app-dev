import type { RemediationHint } from "./logger-format-types.js";

const PAD_WIDTH = 2;

export function formatTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(PAD_WIDTH, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatRemediation(r: RemediationHint | undefined): string {
    if (!r) return "";
    return r.docsUrl ? ` ↪ ${r.action} (${r.docsUrl})` : ` ↪ ${r.action}`;
}
