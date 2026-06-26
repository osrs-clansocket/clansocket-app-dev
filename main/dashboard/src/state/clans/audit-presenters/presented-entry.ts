import type { AuditSemantic } from "./audit-semantic.js";
import type { IconEntry } from "../../../icons/providers.js";

export interface PresentedEntry {
    title: string;
    detail: string;
    icon: IconEntry;
    semantic: AuditSemantic;
    hasExpansion: boolean;
}
