import type { AuditSemantic } from "./audit-semantic.js";

export interface PresentedEntry {
    title: string;
    detail: string;
    icon: string;
    semantic: AuditSemantic;
    hasExpansion: boolean;
}
