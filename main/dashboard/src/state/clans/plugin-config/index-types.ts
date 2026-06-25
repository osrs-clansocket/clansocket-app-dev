import type { Scope as _Scope, Values as _Values } from "../../../shared/constants/plugin-config/scope-constants.js";
export type Scope = _Scope;
export type Values = _Values;
import {
    GLOBAL_SCOPE as _GLOBAL_SCOPE,
    GLOBAL_TITLE_TEXT as _GLOBAL_TITLE_TEXT,
} from "../../../shared/constants/plugin-config/scope-constants.js";
export const GLOBAL_SCOPE = _GLOBAL_SCOPE;
export const GLOBAL_TITLE_TEXT = _GLOBAL_TITLE_TEXT;
import { seedValues as _seedValues, effectiveValues as _effectiveValues } from "./index-values-resolver.js";
export const seedValues = _seedValues;
export const effectiveValues = _effectiveValues;
import { scopeEquals as _scopeEquals } from "./index-scope-equals.js";
export const scopeEquals = _scopeEquals;
import {
    scopeTitle as _scopeTitle,
    publishLabel as _publishLabel,
    clearLabel as _clearLabel,
    metaText as _metaText,
} from "./index-scope-labels.js";
export const scopeTitle = _scopeTitle;
export const publishLabel = _publishLabel;
export const clearLabel = _clearLabel;
export const metaText = _metaText;
