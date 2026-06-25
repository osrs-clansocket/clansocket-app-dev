import { isNumber, requireStrings, type PayloadValidator } from "./type-guards.js";

export const FIELD_DECLARED_RSN = "declaredRsn";
export const alwaysTrue: PayloadValidator = () => true;
export const requireCount: PayloadValidator = (p) => isNumber(p.count);
export const requireDeclaredRsn = requireStrings(FIELD_DECLARED_RSN);
export const requireRequestResolved = requireStrings("targetSiteAccountId", FIELD_DECLARED_RSN);
export const requireVaultEntryKey = requireStrings("entry_key");
