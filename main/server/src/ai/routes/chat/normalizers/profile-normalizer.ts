import type { ProfileContext } from "../../../chain/chain-state-store.js";
import { asArray, asFiniteNumber, asObject, asString, copyIfString } from "../../../../shared/coerce.js";

function readSessionEntry(raw: unknown): ProfileContext["session"][number] | null {
    const e = asObject(raw);
    if (e === null) return null;
    const turn = asFiniteNumber(e.turn);
    const they = asString(e.they);
    const i = asString(e.i);
    if (turn === null || they === null || i === null) return null;
    const out: ProfileContext["session"][number] = { turn, they, i };
    const target = out as unknown as Record<string, unknown>;
    copyIfString(target, e, "learned");
    copyIfString(target, e, "fix");
    copyIfString(target, e, "failure");
    return out;
}

export function normalizeProfile(raw: unknown): ProfileContext | null {
    const r = asObject(raw);
    if (r === null) return null;
    const identity: Record<string, string> = {};
    const identityRaw = asObject(r.identity);
    if (identityRaw)
        for (const [k, v] of Object.entries(identityRaw)) {
            const s = asString(v);
            if (s !== null) identity[k] = s;
        }
    const session: ProfileContext["session"] = [];
    const sessionRaw = asArray(r.session);
    if (sessionRaw)
        for (const entry of sessionRaw) {
            const e = readSessionEntry(entry);
            if (e !== null) session.push(e);
        }
    return { identity, session, focus: asString(r.focus) };
}
