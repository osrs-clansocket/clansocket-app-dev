import type { CheckOp, PressKeyOp, SelectOptionOp, SetValueOp, ToggleOpenOp } from "../../types.js";
import { isNonEmpty } from "./pickers.js";

function isObjectShape<T>(raw: unknown): raw is T {
    return Boolean(raw) && typeof raw === "object";
}

export function setValue(raw: unknown): SetValueOp | null {
    if (!isObjectShape<{ target?: unknown; value?: unknown }>(raw)) return null;
    if (!isNonEmpty(raw.target)) return null;
    const value = typeof raw.value === "string" ? raw.value : String(raw.value ?? "");
    return { target: raw.target, value };
}

export function normalizeCheckOp(raw: unknown): CheckOp | null {
    if (!isObjectShape<{ target?: unknown; checked?: unknown }>(raw)) return null;
    if (!isNonEmpty(raw.target) || typeof raw.checked !== "boolean") return null;
    return { target: raw.target, checked: raw.checked };
}

export function selectOption(raw: unknown): SelectOptionOp | null {
    if (!isObjectShape<{ target?: unknown; value?: unknown }>(raw)) return null;
    if (!isNonEmpty(raw.target) || typeof raw.value !== "string") return null;
    return { target: raw.target, value: raw.value };
}

export function pressKey(raw: unknown): PressKeyOp | null {
    if (!isObjectShape<{ target?: unknown; key?: unknown }>(raw)) return null;
    if (!isNonEmpty(raw.target) || !isNonEmpty(raw.key)) return null;
    return { target: raw.target, key: raw.key };
}

export function toggleOpen(raw: unknown): ToggleOpenOp | null {
    if (!isObjectShape<{ target?: unknown; open?: unknown }>(raw)) return null;
    if (!isNonEmpty(raw.target) || typeof raw.open !== "boolean") return null;
    return { target: raw.target, open: raw.open };
}
