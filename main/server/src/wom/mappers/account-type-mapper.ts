import { lookupOrFallback } from "./lookup-mapper.js";

export type ClanSocketAccountType = "regular" | "ironman" | "hardcore_ironman" | "ultimate_ironman" | "unknown";

const ACCOUNT_TYPE_LOOKUP: Record<string, ClanSocketAccountType> = {
    regular: "regular",
    normal: "regular",
    ironman: "ironman",
    hardcore: "hardcore_ironman",
    ultimate: "ultimate_ironman",
    hardcore_ironman: "hardcore_ironman",
    ultimate_ironman: "ultimate_ironman",
    group_ironman: "ironman",
    hardcore_group_ironman: "hardcore_ironman",
    unranked_group_ironman: "ironman",
    unknown: "unknown",
};

export function mapAccountType(womType: string | null | undefined): ClanSocketAccountType {
    return lookupOrFallback(womType, ACCOUNT_TYPE_LOOKUP, "unknown");
}
