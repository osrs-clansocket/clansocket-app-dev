import { previousTurnSection } from "../section-builders/previous-turn-section.js";
import { actionCooldownsSection } from "../section-builders/action-cooldowns-section.js";
import { chainJournalSection } from "../section-builders/chain-journal-section.js";
import { pinnedSection } from "../section-builders/pinned-section.js";
import { profileSection } from "../section-builders/profile-section.js";
import type { ProfileContext } from "./types.js";

export interface DynamicSectionsArgs {
    siteAccountId: string;
    historyWindow: number;
    profile: ProfileContext | null;
    priorRawResponse: string | null;
    priorUserMessage: string | null;
}

export function appendDynamicSections(sections: string[], args: DynamicSectionsArgs): void {
    const profileSec = profileSection(args.profile, args.historyWindow);
    if (profileSec) sections.push(profileSec);
    const pinnedSec = pinnedSection(args.siteAccountId);
    if (pinnedSec) sections.push(pinnedSec);
    sections.push(actionCooldownsSection(args.siteAccountId));
    const journalSec = chainJournalSection(args.siteAccountId);
    if (journalSec) sections.push(journalSec);
    const previousSec = previousTurnSection(args.priorRawResponse, args.priorUserMessage);
    if (previousSec) sections.push(previousSec);
    sections.push("--- END OF SYSTEM PROMPT ---");
}
