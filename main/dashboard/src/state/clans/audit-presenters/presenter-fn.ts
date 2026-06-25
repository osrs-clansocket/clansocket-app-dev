import type { ClanAuditEntry } from "../clans-client/index.js";
import type { PresentedEntry } from "./presented-entry.js";

export type Presenter = (entry: ClanAuditEntry) => PresentedEntry;
