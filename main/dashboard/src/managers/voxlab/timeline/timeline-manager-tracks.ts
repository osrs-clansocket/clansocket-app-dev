import type { ApplyPresetArgs as _ApplyPresetArgs } from "./timeline-track-types.js";
export type ApplyPresetArgs = _ApplyPresetArgs;
import {
    upsertKeyframe as _upsertKeyframe,
    upsertSimpleKeyframe as _upsertSimpleKeyframe,
} from "./timeline-track-upsert.js";
export const upsertKeyframe = _upsertKeyframe;
export const upsertSimpleKeyframe = _upsertSimpleKeyframe;
import { applyTrackKeyframes as _applyTrackKeyframes, snapPath as _snapPath } from "./timeline-track-apply.js";
export const applyTrackKeyframes = _applyTrackKeyframes;
export const snapPath = _snapPath;
import {
    deletePresetKeyframes as _deletePresetKeyframes,
    removePresetTrack as _removePresetTrack,
} from "./timeline-track-remove.js";
export const deletePresetKeyframes = _deletePresetKeyframes;
export const removePresetTrack = _removePresetTrack;
import { collectPresetIds as _collectPresetIds } from "./timeline-track-collect.js";
export const collectPresetIds = _collectPresetIds;
import { moveAllKeyframes as _moveAllKeyframes } from "./timeline-track-move.js";
export const moveAllKeyframes = _moveAllKeyframes;
import {
    buildDraftSnapshot as _buildDraftSnapshot,
    computeAnimatedParts as _computeAnimatedParts,
} from "./timeline-track-snapshot.js";
export const buildDraftSnapshot = _buildDraftSnapshot;
export const computeAnimatedParts = _computeAnimatedParts;
