import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultScaffold, isDefaultIconKey } from "./homepage-default-scaffold.ts";

test("defaultScaffold returns non-empty array", () => {
    const components = defaultScaffold();
    assert.ok(components.length > 0);
});

test("every default component has unique componentId", () => {
    const ids = new Set<string>();
    for (const c of defaultScaffold()) {
        assert.ok(!ids.has(c.componentId), `duplicate id: ${c.componentId}`);
        ids.add(c.componentId);
    }
});

test("every default component has valid kind", () => {
    const valid = new Set(["heading", "paragraph", "image", "spacer", "container", "kpi"]);
    for (const c of defaultScaffold()) {
        assert.ok(valid.has(c.componentName), `invalid kind: ${c.componentName}`);
    }
});

test("every default component has non-negative coords", () => {
    for (const c of defaultScaffold()) {
        assert.ok(c.canvasX >= 0, `${c.componentId} canvasX = ${c.canvasX}`);
        assert.ok(c.canvasY >= 0, `${c.componentId} canvasY = ${c.canvasY}`);
        assert.ok(c.canvasW > 0);
        assert.ok(c.canvasH > 0);
    }
});

test("isDefaultIconKey identifies the sentinel", () => {
    assert.equal(isDefaultIconKey("__clan_icon__"), true);
    assert.equal(isDefaultIconKey("upload-abc123"), false);
    assert.equal(isDefaultIconKey(undefined), false);
});

test("scaffold contains an image component using the default icon sentinel", () => {
    const components = defaultScaffold();
    const hasDefaultIcon = components.some((c) => c.componentName === "image" && isDefaultIconKey(c.payload.imageKey));
    assert.ok(hasDefaultIcon, "scaffold should include the default clan icon");
});

test("scaffold contains at least one KPI tile", () => {
    const components = defaultScaffold();
    const kpis = components.filter((c) => c.componentName === "kpi");
    assert.ok(kpis.length > 0, "scaffold should include KPI tiles");
});
