import { isSupportedKind as _isSupportedKind, mount as _mount } from "./factory-mount.js";
import { unmount as _unmount, update as _update } from "./factory-actions.js";
import type { AnySpec as _AnySpec, SpecByKind as _SpecByKind } from "./factory-types.js";

export const isSupportedKind = _isSupportedKind;
export const mount = _mount;
export const unmount = _unmount;
export const update = _update;
export type AnySpec = _AnySpec;
export type SpecByKind = _SpecByKind;
