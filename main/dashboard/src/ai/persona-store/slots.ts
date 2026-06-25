import {
    buildSlot,
    DOMAIN,
    ENGAGEMENT,
    IDENTITY,
    POLICY,
    type SlotMeta,
    type SlotTier,
    type SlotTuple,
} from "./slots-types.js";
export {
    CTRL_BLOCK,
    CTRL_ENTRY,
    CTRL_NUMBER,
    CTRL_RANGE,
    CTRL_SELECT,
    CTRL_TOGGLE,
    DOMAIN,
    ENGAGEMENT,
    IDENTITY,
    NUMBER,
    POLICY,
    PROSE,
} from "./slots-types.js";
export type { ControlType, SlotBounds, SlotMeta, SlotTier, SlotType } from "./slots-types.js";
import { IDENTITY_TUPLES } from "./slots-identity.js";
import { ENGAGEMENT_TUPLES } from "./slots-engagement.js";
import { DOMAIN_TUPLES, POLICY_TUPLES } from "./slots-policy.js";

const TIER_GROUPS: readonly (readonly [SlotTier, readonly SlotTuple[]])[] = [
    [IDENTITY, IDENTITY_TUPLES],
    [ENGAGEMENT, ENGAGEMENT_TUPLES],
    [POLICY, POLICY_TUPLES],
    [DOMAIN, DOMAIN_TUPLES],
];

export const CLIENT_SLOTS: readonly SlotMeta[] = TIER_GROUPS.flatMap(([tier, tuples]) =>
    tuples.map((t) => buildSlot(tier, t)),
);

export const SLOT_BY_KEY: ReadonlyMap<string, SlotMeta> = new Map(CLIENT_SLOTS.map((s) => [s.key, s]));

export function slotsByTier(tier: SlotTier): readonly SlotMeta[] {
    return CLIENT_SLOTS.filter((s) => s.tier === tier);
}
