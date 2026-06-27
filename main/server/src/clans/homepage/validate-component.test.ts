import { test } from "node:test";
import assert from "node:assert/strict";
import { validateComponents } from "./validate-component.ts";

function base(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        componentId: "c-1",
        componentName: "heading",
        canvasX: 100,
        canvasY: 200,
        canvasW: 300,
        canvasH: 60,
        zIndex: 0,
        payload: {},
        tokenOverrides: {},
        parentId: null,
        ...overrides,
    };
}

test("rejects non-array input", () => {
    const { components, errors } = validateComponents("not an array");
    assert.equal(components.length, 0);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].code, "shape");
});

test("accepts a valid heading component", () => {
    const { components, errors } = validateComponents([base()]);
    assert.equal(errors.length, 0);
    assert.equal(components.length, 1);
    assert.equal(components[0].componentName, "heading");
});

test("rejects invalid componentId regex", () => {
    const { errors } = validateComponents([base({ componentId: "BAD_ID_$$$" })]);
    assert.equal(errors[0].code, "component_id");
});

test("rejects unknown componentName", () => {
    const { errors } = validateComponents([base({ componentName: "marquee" })]);
    assert.equal(errors[0].code, "component_name");
});

test("clamps canvasX/Y/W/H to canvas bounds", () => {
    const { components } = validateComponents([base({ canvasX: 99999, canvasY: -50 })]);
    assert.equal(components[0].canvasX, 9999);
    assert.equal(components[0].canvasY, 0);
});

test("clamps zIndex to allowed range", () => {
    const { components } = validateComponents([base({ zIndex: 500 })]);
    assert.equal(components[0].zIndex, 100);
});

test("strips HTML tags from payload.text", () => {
    const { components } = validateComponents([base({ payload: { text: "Hello <script>evil</script> world" } })]);
    assert.equal(components[0].payload.text, "Hello evil world");
});

test("rejects invalid image key format", () => {
    const { errors } = validateComponents([base({ componentName: "image", payload: { imageKey: "BAD KEY WITH SPACES" } })]);
    assert.equal(errors[0].code, "image_key");
});

test("rejects unknown token override property", () => {
    const { errors } = validateComponents([base({ tokenOverrides: { "--unknown-prop": "var(--base-gold-300)" } })]);
    assert.equal(errors[0].code, "unknown_property");
});

test("rejects token value not in allowlist", () => {
    const { errors } = validateComponents([base({ tokenOverrides: { "--color": "red" } })]);
    assert.equal(errors[0].code, "value_not_allowed");
});

test("accepts valid token override", () => {
    const { components, errors } = validateComponents([base({ tokenOverrides: { "--color": "var(--base-gold-300)" } })]);
    assert.equal(errors.length, 0);
    assert.equal(components[0].tokenOverrides["--color"], "var(--base-gold-300)");
});

test("rejects duplicate componentId", () => {
    const { errors } = validateComponents([base({ componentId: "c-1" }), base({ componentId: "c-1" })]);
    assert.ok(errors.some((e) => e.code === "duplicate_id"));
});

test("rejects parentId pointing at missing component", () => {
    const { errors, components } = validateComponents([base({ componentId: "c-1", parentId: "c-missing" })]);
    assert.ok(errors.some((e) => e.code === "parent_missing"));
    assert.equal(components[0].parentId, null);
});

test("rejects parentId pointing at non-container", () => {
    const { errors, components } = validateComponents([
        base({ componentId: "p-1", componentName: "heading" }),
        base({ componentId: "c-1", parentId: "p-1" }),
    ]);
    assert.ok(errors.some((e) => e.code === "parent_not_container"));
    const child = components.find((c) => c.componentId === "c-1");
    assert.equal(child?.parentId, null);
});

test("accepts parentId pointing at container", () => {
    const { errors, components } = validateComponents([
        base({ componentId: "p-1", componentName: "container" }),
        base({ componentId: "c-1", parentId: "p-1" }),
    ]);
    assert.equal(errors.length, 0);
    const child = components.find((c) => c.componentId === "c-1");
    assert.equal(child?.parentId, "p-1");
});
