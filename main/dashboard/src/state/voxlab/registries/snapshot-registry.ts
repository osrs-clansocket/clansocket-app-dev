import type { PathSpec as _PathSpec, SnapshotPart as _SnapshotPart } from "./snapshot-path-types.js";
export type PathSpec = _PathSpec;
export type SnapshotPart = _SnapshotPart;
import {
    SnapshotRegistry as _SnapshotRegistry,
    snapshotRegistry as _snapshotRegistry,
} from "./snapshot-registry-class.js";
export const SnapshotRegistry = _SnapshotRegistry;
export type SnapshotRegistry = InstanceType<typeof _SnapshotRegistry>;
export const snapshotRegistry = _snapshotRegistry;
import { pathColor as _pathColor, pathNumber as _pathNumber, pathStep as _pathStep } from "./snapshot-path-typed.js";
export const pathColor = _pathColor;
export const pathNumber = _pathNumber;
export const pathStep = _pathStep;
import { nestedPath as _nestedPath } from "./snapshot-path-nested.js";
export const nestedPath = _nestedPath;
import { indexedNumberPath as _indexedNumberPath } from "./snapshot-path-indexed.js";
export const indexedNumberPath = _indexedNumberPath;
