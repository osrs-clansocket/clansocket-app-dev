import { signal } from "../../dom/factory/reactive/index.js";
import type { Instance } from "../../dom/factory/core/index.js";

export const inspectorOverride$ = signal<(() => Instance[]) | null>(null);
