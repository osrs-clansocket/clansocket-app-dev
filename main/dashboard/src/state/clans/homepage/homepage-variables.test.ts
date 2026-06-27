import { test } from "node:test";
import assert from "node:assert/strict";
import { interpolate, type HomepageContext } from "./homepage-variables.ts";
import type { ManagedClan } from "../clans-client/index.ts";

function ctx(overrides: Partial<HomepageContext> = {}): HomepageContext {
    const clan: ManagedClan = {
        id: "clan-id-1",
        slug: "varietyz",
        displayName: "Varietyz",
        status: "active",
        role: "manager",
        grantedVia: "owner",
        grantedAt: 0,
        createdAt: Date.UTC(2023, 5, 15),
        iconKind: null,
        iconValue: null,
        iconCustomized: false,
        iconTransform: null,
        iconVersion: 0,
        color: null,
        roster: null,
    };
    return {
        clan,
        memberCount: 42,
        iconUrl: "/api/clans/varietyz/icon",
        establishedYear: 2021,
        ...overrides,
    };
}

test("interpolates clan.name", () => {
    assert.equal(interpolate("Welcome to {{clan.name}}!", ctx()), "Welcome to Varietyz!");
});

test("interpolates clan.memberCount as string", () => {
    assert.equal(interpolate("{{clan.memberCount}} members", ctx()), "42 members");
});

test("interpolates clan.establishedYear", () => {
    assert.equal(interpolate("Since {{clan.establishedYear}}", ctx()), "Since 2021");
});

test("falls back to em-dash when establishedYear is null", () => {
    assert.equal(interpolate("est. {{clan.establishedYear}}", ctx({ establishedYear: null })), "est. —");
});

test("passes unknown variables through unchanged", () => {
    assert.equal(interpolate("Hello {{unknown.var}}", ctx()), "Hello {{unknown.var}}");
});

test("interpolates multiple variables in one string", () => {
    assert.equal(
        interpolate("{{clan.name}} · {{clan.memberCount}} members · est. {{clan.establishedYear}}", ctx()),
        "Varietyz · 42 members · est. 2021",
    );
});

test("ignores malformed variable syntax", () => {
    assert.equal(interpolate("Hello {clan.name}", ctx()), "Hello {clan.name}");
});

test("interpolates clan.iconUrl", () => {
    assert.equal(interpolate("[icon: {{clan.iconUrl}}]", ctx()), "[icon: /api/clans/varietyz/icon]");
});

test("returns empty string unchanged", () => {
    assert.equal(interpolate("", ctx()), "");
});

test("does not match nested braces aggressively", () => {
    assert.equal(interpolate("{{ {{clan.name}} }}", ctx()), "{{ Varietyz }}");
});
