import { test } from "node:test";
import assert from "node:assert/strict";
import { interpolate, type HomepageContext } from "./homepage-variables.ts";
import type { MetricValue } from "./homepage-metrics-store.ts";
import type { HeatmapCell } from "./homepage-heatmaps-store.ts";
import type { TimeseriesPoint } from "./homepage-timeseries-store.ts";
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
    const metricsMap = new Map<string, MetricValue>();
    const heatmapsMap = new Map<string, HeatmapCell[]>();
    const timeseriesMap = new Map<string, TimeseriesPoint[]>();
    return {
        clan,
        memberCount: 42,
        iconUrl: "/api/clans/varietyz/icon",
        establishedYear: 2021,
        metrics: () => metricsMap,
        heatmaps: () => heatmapsMap,
        timeseries: () => timeseriesMap,
        ...overrides,
    };
}

test("interpolates a live metric with int formatting", () => {
    const metricsMap = new Map<string, MetricValue>([["clan.npc_kc.kc.total", { value: 1234567, format: "int" }]]);
    assert.equal(
        interpolate("KC {{clan.npc_kc.kc.total}}", ctx({ metrics: () => metricsMap })),
        "KC 1,234,567",
    );
});

test("interpolates a live metric with gp formatting", () => {
    const metricsMap = new Map<string, MetricValue>([["clan.loot.value_gp.total", { value: 12345, format: "gp" }]]);
    assert.equal(
        interpolate("Loot {{clan.loot.value_gp.total}}", ctx({ metrics: () => metricsMap })),
        "Loot 12,345 gp",
    );
});

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

test("returns empty string unchanged", () => {
    assert.equal(interpolate("", ctx()), "");
});

test("does not match nested braces aggressively", () => {
    assert.equal(interpolate("{{ {{clan.name}} }}", ctx()), "{{ Varietyz }}");
});
