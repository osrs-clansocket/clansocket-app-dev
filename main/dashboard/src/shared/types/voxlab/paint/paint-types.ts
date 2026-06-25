import type {
    BrushMode as _BrushMode,
    BrushState as _BrushState,
    BrushChange as _BrushChange,
} from "./paint-brush-types.js";
export type BrushMode = _BrushMode;
export type BrushState = _BrushState;
export type BrushChange = _BrushChange;
import type {
    MeshPart as _MeshPart,
    PartsPaintState as _PartsPaintState,
    PartsFill as _PartsFill,
    PartsReset as _PartsReset,
    PartsSectionState as _PartsSectionState,
} from "./paint-parts-types.js";
export type MeshPart = _MeshPart;
export type PartsPaintState = _PartsPaintState;
export type PartsFill = _PartsFill;
export type PartsReset = _PartsReset;
export type PartsSectionState = _PartsSectionState;
import type {
    PaintOverride as _PaintOverride,
    PaintSnapshotState as _PaintSnapshotState,
    PaintClearAll as _PaintClearAll,
} from "./paint-snapshot-types.js";
export type PaintOverride = _PaintOverride;
export type PaintSnapshotState = _PaintSnapshotState;
export type PaintClearAll = _PaintClearAll;
export type {
    GradientType,
    GradientAxis,
    GradientTarget,
    GradientStop,
    GradientSpec,
    GradientApply,
} from "./paint-gradient-types.js";
import type {
    AlbedoSource as _AlbedoSource,
    AlbedoSettings as _AlbedoSettings,
    AlbedoChange as _AlbedoChange,
} from "./paint-albedo-types.js";
export type AlbedoSource = _AlbedoSource;
export type AlbedoSettings = _AlbedoSettings;
export type AlbedoChange = _AlbedoChange;
export type {
    PbrMapSlot,
    PbrMapsSettings,
    PbrIntensitySettings,
    PbrMapsChange,
    PbrMapApply,
    PbrGenerate,
} from "./paint-pbr-types.js";
